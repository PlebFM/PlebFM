import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import Hosts from '../../models/Host';
import { planForHost } from '../../lib/subscriptions';
import { requireHostSession } from '../../lib/auth';
import {
  hostUpdates,
  publicHost,
  PUBLIC_HOST_FIELDS,
} from '../../lib/public-host';
import { HttpError, methodNotAllowed, sendError } from '../../lib/http';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const filter: Record<string, unknown> = { deletedAt: null };
      if (typeof req.query.spotifyId === 'string')
        filter.spotifyId = req.query.spotifyId;
      else filter.shortName = { $exists: true };
      const hosts = await Hosts.find(filter).select(PUBLIC_HOST_FIELDS).lean();
      return res
        .status(200)
        .json({ success: true, hosts: hosts.map(publicHost) });
    }
    if (req.method === 'PATCH') {
      const session = await requireHostSession(req, res);
      if (!session) return;
      let update;
      try {
        update = hostUpdates(req.body);
      } catch (e) {
        throw new HttpError(400, (e as Error).message);
      }
      if (
        ('accentColor' in update || 'welcomeMessage' in update) &&
        (await planForHost(session.user.id!)).id !== 'pro'
      )
        throw new HttpError(403, 'Custom branding requires Pro');
      const host = await Hosts.findOneAndUpdate(
        { hostId: session.user.id, deletedAt: null },
        { $set: update },
        { new: true, runValidators: true },
      );
      if (!host) throw new HttpError(404, 'Jukebox not found');
      return res.status(200).json({ success: true, data: publicHost(host) });
    }
    return methodNotAllowed(res, ['GET', 'PATCH']);
  } catch (e: any) {
    if (e.code === 11000)
      return res
        .status(409)
        .json({ error: 'That name or URL is already in use' });
    return sendError(res, e);
  }
};
export default connectDB(handler);
