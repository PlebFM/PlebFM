import { randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Hosts from '../../../models/Host';
import Plays from '../../../models/Play';
import Accounts from '../../../models/HostAccount';
import { requireHostSession } from '../../../lib/auth';
import { getQueue } from '../../../lib/queue';
import {
  getSpotifyQueue,
  getSpotifyRecentlyPlayed,
  addTrackToSpotifyQueue,
  startSpotifyQueue,
} from '../../../lib/spotify';
import { HttpError, methodNotAllowed } from '../../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  const shortName =
    req.method === 'GET' ? req.query.shortName : req.body?.shortName;
  if (typeof shortName !== 'string')
    throw new HttpError(400, 'Jukebox URL is required');
  const host = await Hosts.findOne({ shortName, deletedAt: null });
  if (!host) throw new HttpError(404, 'Jukebox not found');
  if (req.method === 'GET') {
    const data = await getQueue(host.hostId, {
      userId:
        typeof req.query.userId === 'string' ? req.query.userId : undefined,
      includePlaying: req.query.playing === 'true',
      includeNext: req.query.next !== 'false',
      limit: Math.min(100, Math.max(1, Number(req.query._limit) || 100)),
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ success: true, data });
  }
  if (!['POST', 'PUT', 'DELETE'].includes(req.method ?? ''))
    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  const session = await requireHostSession(req, res);
  if (!session) return;
  if (session.user.id !== host.hostId)
    throw new HttpError(403, 'This jukebox belongs to another host');
  const token = session.accessToken!;
  const deviceId =
    typeof req.body.deviceId === 'string' ? req.body.deviceId : '';
  if (req.method === 'DELETE') {
    await Plays.updateMany(
      { hostId: host.hostId, status: { $in: ['queued', 'next'] } },
      { $set: { status: 'removed' } },
    );
    return res.json({ success: true });
  }
  if (req.method === 'PUT') {
    const playing = await Plays.findOne({
      hostId: host.hostId,
      status: 'playing',
    });
    const current = await getSpotifyQueue(token);
    const uri = playing
      ? `spotify:track:${playing.songId}`
      : 'spotify:track:0vFOzaXqZHahrZp6enQwQb';
    if (!playing || current?.currently_playing?.id !== playing.songId)
      await startSpotifyQueue(uri, deviceId, token);
    return res.json({ success: true });
  }
  await Accounts.updateOne(
    { _id: host.hostId },
    { $setOnInsert: { balanceSats: 0 } },
    { upsert: true },
  );
  const leaseId = randomUUID();
  const lease = await Accounts.findOneAndUpdate(
    {
      _id: host.hostId,
      $or: [
        { queueLeaseUntil: { $lt: new Date() } },
        { queueLeaseUntil: { $exists: false } },
      ],
    },
    {
      $set: {
        queueLeaseUntil: new Date(Date.now() + 30000),
        queueLeaseId: leaseId,
      },
    },
  );
  if (!lease) return res.json({ success: true, data: { updated: false } });
  try {
    const spotify = await getSpotifyQueue(token);
    const recent = await getSpotifyRecentlyPlayed(token, 20);
    const currentId = spotify?.currently_playing?.id;
    const recentIds = new Set(
      recent?.items?.map((item: any) => item.track?.id),
    );
    for (const play of await Plays.find({
      hostId: host.hostId,
      status: 'playing',
    })) {
      if (play.songId !== currentId && recentIds.has(play.songId))
        await Plays.updateOne(
          { playId: play.playId },
          {
            $set: { status: 'played', playedTimestamp: Date.now().toString() },
          },
        );
    }
    if (currentId)
      await Plays.updateOne(
        { hostId: host.hostId, songId: currentId, status: 'next' },
        { $set: { status: 'playing', playedTimestamp: Date.now().toString() } },
      );
    let next = await Plays.findOne({ hostId: host.hostId, status: 'next' });
    if (!next)
      next = await Plays.findOneAndUpdate(
        { hostId: host.hostId, status: 'queued' },
        { $set: { status: 'next' } },
        { sort: { runningTotal: -1, queueTimestamp: 1 }, new: true },
      );
    if (next && !spotify?.queue?.some((track: any) => track.id === next.songId))
      await addTrackToSpotifyQueue(
        `spotify:track:${next.songId}`,
        deviceId,
        token,
      );
    return res.json({ success: true, data: { updated: true } });
  } finally {
    await Accounts.updateOne(
      { _id: host.hostId, queueLeaseId: leaseId },
      { $unset: { queueLeaseUntil: 1, queueLeaseId: 1 } },
    );
  }
});
