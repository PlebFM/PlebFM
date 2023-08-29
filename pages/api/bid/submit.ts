import { NextApiRequest, NextApiResponse } from 'next';
import cuid from 'cuid';
import Hosts, { Host } from '../../../models/Host';
import Users, { User } from '../../../models/User';
import Plays, { Play } from '../../../models/Play';
import { Bid } from '../../../models/Bid';
import connectDB from '../../../middleware/mongodb';
import { getTrack } from '../../../lib/spotify';
import { Song } from '../../../models/Song';

const handleExistingBid = async (bid: Bid, existingPlay: Play, user: User) => {
  const totalAmount =
    bid.bidAmount +
    existingPlay.bids.reduce((x: number, bid: Bid) => x + bid.bidAmount, 0);
  const updateObj = {
    $push: { bids: bid },
    runningTotal: (totalAmount * 1000.0 * 60) / existingPlay.songLength,
  };
  const result = await Plays.findOneAndUpdate(
    { playId: existingPlay.playId },
    updateObj,
  );
  console.log('FOUND AND UPDATED', result);
  return result;
};

const handleNewBid = async (bid: Bid, track: Song, host: Host) => {
  const newPlay: Play = {
    playId: cuid(),
    hostId: host.hostId,
    songId: track.songId,
    status: 'queued',
    queueTimestamp: bid.timestamp,
    playedTimestamp: undefined,
    bids: new Array<Bid>(bid),
    runningTotal: (bid.bidAmount * 1000.0 * 60) / track.duration_ms,
    songLength: 1000 * track.duration_ms,
    songArtist: track.artists[0].name,
    songName: track.name,
    albumUri: track.album.images[0]?.url,
  };
  const result = await Plays.create(newPlay).catch((e: string | undefined) => {
    console.error(e);
  });
  console.log('CREATED', result);
  return result;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST')
      return res.status(403).json({ success: false, error: 'Forbidden!' });

    const { hostId, userId, rHash, songId, bidAmount } = req.body;
    const { isNew, playId } = req.query;
    const bidNotNew: boolean = !Boolean(isNew);
    const noPlayId: boolean = !playId;

    if (bidNotNew && noPlayId)
      return res.status(400).json({
        success: false,
        message: 'Must pass playId if bid is not new!',
      });

    const host = await Hosts.findOne({ shortName: hostId });
    if (!host)
      return res.status(404).json({ success: false, error: 'Host not found!' });

    const user = await Users.findOne({ userId: userId });
    if (!user)
      return res.status(404).json({ success: false, error: 'User not found!' });

    const rHashDuplicated = await Plays.findOne({
      'bids.rHash': { $eq: rHash },
    }).catch(e => {
      console.error(e);
      throw new Error(e);
    });
    if (rHashDuplicated)
      return res
        .status(400)
        .json({ success: false, error: 'Duplicate rHash found!' });

    const existingPlay = await Plays.findOne({
      hostId: host.hostId,
      songId: songId,
      status: 'queued',
    });

    const now = Date.now().toString();
    const newBid: Bid = {
      bidId: cuid(),
      user: user,
      bidAmount: parseInt(bidAmount),
      timestamp: now,
      rHash: rHash,
    };

    if (existingPlay) {
      const result = await handleExistingBid(newBid, existingPlay, user);
      return res.status(200).json({ success: true, message: result });
    } else {
      // New play
      //@ts-ignore
      const accessToken: string = req.headers.accessToken;
      const track = await getTrack(songId, accessToken);
      const result = await handleNewBid(newBid, track, host);
      return res.status(200).json({ success: true, message: result });
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export default connectDB(handler);
