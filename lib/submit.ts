import cuid from 'cuid';
import Hosts from '../models/Host';
import Users, { User } from '../models/User';
import Plays, { Play } from '../models/Play';
import { Bid } from '../models/Bid';
import { MongoError } from 'mongodb';

const Anon: User = {
  userId: 'anon',
  firstNym: 'Anon',
  lastNym: '',
  avatar: 'anon',
  // color: 'grey'
};

export const submitBid = async (
  hostId: string,
  rHash: string,
  songId: string,
  bidAmount: number,
  userId: string,
) => {
  const host = await Hosts.findOne({ shortName: hostId });
  if (!host) throw new Error('Submit Bid failed: Host not found!');

  const user = await Users.findOne({ userId: userId });
  console.log(user);
  // if (!user) throw new Error('Submit Bid failed: User not found!');

  const existingPlay = await Plays.findOne({
    songId: songId,
    status: 'queued',
  });
  const now: string = Date.now().toString();
  const bid: Bid = {
    bidId: cuid(),
    user: user ?? Anon,
    bidAmount: bidAmount,
    timestamp: now,
    rHash: rHash,
  };
  if (existingPlay) {
    // update existing play
    const result = await Plays.findOneAndUpdate(
      { playId: existingPlay.playId },
      { $push: { bids: bid }, $inc: { runningTotal: bidAmount } },
    ).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });
    console.log('EXISTING PLAY', result);
    return result;
  } else {
    // Create new play
    const play: Play = {
      playId: cuid(),
      hostId: host.hostId,
      songId: songId,
      status: 'queued',
      queueTimestamp: now,
      playedTimestamp: undefined,
      bids: new Array<Bid>(bid),
      runningTotal: bidAmount,
    };
    const result = await Plays.create(play).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });
    console.log('NEW PLAY', result);
    return result;
  }
};
