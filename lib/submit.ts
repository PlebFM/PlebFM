import { createId } from '@paralleldrive/cuid2';
import Hosts, { Host } from '../models/Host';
import Users, { User } from '../models/User';
import Plays, { Play } from '../models/Play';
import { Bid } from '../models/Bid';
import { Song } from '../models/Song';
import { getTrack } from './spotify';
import { triggerBid } from './pusher';

const Anon: User = {
  userId: 'anon',
  firstNym: 'Anon',
  lastNym: '',
  avatar: 'anon',
  // color: 'grey'
};
const handleExistingBid = async (bid: Bid, existingPlay: Play) => {
  const totalAmount =
    bid.bidAmount +
    existingPlay.bids.reduce((x: number, bid: Bid) => x + bid.bidAmount, 0);
  const updateObj = {
    $push: { bids: bid },
    runningTotal: (totalAmount * 60) / existingPlay.songLength,
  };
  const result = await Plays.findOneAndUpdate(
    { playId: existingPlay.playId },
    updateObj,
    { new: true },
  );
  return result;
};

const handleNewBid = async (bid: Bid, track: Song, host: Host) => {
  const newPlay: Play = {
    playId: createId(),
    hostId: host.hostId,
    songId: track.id,
    status: 'queued',
    queueTimestamp: bid.timestamp,
    playedTimestamp: undefined,
    bids: new Array<Bid>(bid),
    runningTotal: (bid.bidAmount * 60 * 1000) / track.duration_ms,
    songLength: track.duration_ms / 1000.0,
    songArtist: track?.artists?.[0]?.name ?? 'Unknown Artist',
    songName: track.name,
    albumUri: track?.album?.images?.[0]?.url,
  };
  const result = await Plays.create(newPlay).catch((e: string | undefined) => {
    console.error(e);
  });
  return result;
};

export const submitBid = async (
  hostId: string,
  rHash: string,
  songId: string,
  bidAmount: number,
  userId: string,
  accessToken: string,
) => {
  const host = await Hosts.findOne({ shortName: hostId });
  if (!host) throw new Error('Submit Bid failed: Host not found!');

  const user = await Users.findOne({ userId: userId });

  const existingPlay = await Plays.findOne({
    songId: songId,
    status: 'queued',
    hostId: host.hostId,
  });
  const now: string = Date.now().toString();
  const bid: Bid = {
    bidId: createId(),
    user: user ?? Anon,
    bidAmount: bidAmount,
    timestamp: now,
    rHash: rHash,
  };
  if (existingPlay) {
    // Don't double count bid
    if (existingPlay.bids.find((b: Bid) => b.rHash === bid.rHash)) {
      return existingPlay;
    }
    const result = await handleExistingBid(bid, existingPlay);
    await triggerBid(user ?? Anon, result, bid, false, hostId);
    return result;
  } else {
    // Create new play
    const track = await getTrack(songId, accessToken);
    const result = await handleNewBid(bid, track, host);
    await triggerBid(user ?? Anon, result, bid, true, hostId);
    return result;
  }
};
