import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Hosts, { Host } from '../../../models/Host';
import Plays, { Play } from '../../../models/Play';
import withJukebox from '../../../middleware/withJukebox';
import {
  addTrackToSpotifyQueue,
  clearSpotifyQueue,
  getSpotifyQueue,
  startSpotifyQueue,
} from '../../../lib/spotify';

const getQueue = async (
  shortName: string,
  _limit?: string,
  userId?: string,
  includeNext: boolean = true,
): Promise<Play[]> => {
  // const { shortName, _limit, userId } = req.query;
  const limit = parseInt((_limit as string) ?? '10');
  if (!shortName) throw new Error('getQueue - Expected query param shortName!');
  // Lookup host by shortname
  const host: Host = await Hosts.findOne({
    shortName: shortName,
  }).catch(e => {
    console.error(e);
    throw new Error(e);
  });

  // If not host exists, return error

  if (!host) throw new Error('getQueue - No host found for shortName!');
  // Query Plays: Get play objs where hostId = host.hostId & status = queued
  // sort by highest runningTotal and oldest queueTimestamp if ties occur
  const statusFilters = ['queued'];
  if (includeNext) statusFilters.push('next');
  const filter = userId
    ? { hostId: host.hostId, 'bids.user.userId': userId }
    : { hostId: host.hostId, status: statusFilters };
  let sortedPlays: Array<Play> = await Plays.find(
    filter,
    {},
    { options: { limit: limit } },
  )
    // .sort({ runningTotal: -1, queueTimestamp: 1 })
    .catch(e => {
      console.error(e);
      throw new Error(e);
    });

  // Plays.find returns a list of results. If no results found, list will be empty []
  if (sortedPlays.length === 0) return [];

  sortedPlays.sort((a, b) => {
    const suma = a.bids.reduce((x, bid) => x + bid.bidAmount, 0);
    const sumb = b.bids.reduce((x, bid) => x + bid.bidAmount, 0);
    if (a.status === 'next') return -1;
    if (b.status === 'next') return 1;
    return sumb - suma;
  });
  return sortedPlays;
};

const updateQueuedSongs = async (nextPlay: Play) => {
  const song = await Plays.findOneAndUpdate(
    { playId: nextPlay.playId },
    { status: 'next' },
    { new: true },
  );
  return song;
};

// update status of top song to "up next"
// get spotify queue
// add top song to spotify queue
const addNextSong = async (req: NextApiRequest, res: NextApiResponse) => {
  const { shortName, accessToken, deviceId } = req.body;
  const host = await Hosts.findOne({ shortName: shortName });
  console.log('host', host.shortName);
  const spotifyQueue = await getSpotifyQueue(accessToken);
  const jukeboxQueue = await getQueue(shortName, undefined, undefined, false);
  if (spotifyQueue.error || !spotifyQueue?.queue?.length) {
    throw new Error(
      `Get Spotify Queue Failed! error: ${JSON.stringify(spotifyQueue.error)}`,
    );
  }
  const spotifyNext = spotifyQueue?.queue[0];
  const spotifyCurrent = spotifyQueue?.currently_playing;
  const jukeboxTop = jukeboxQueue[0];
  let jukeboxNext = await Plays.findOne({
    status: 'next',
    hostId: host.hostId,
  }).catch(e => {
    console.error(e);
    throw new Error(e);
  });

  // if (!jukeboxTop) throw new Error('No next song found in jukebox queue!');

  // if no next song in jukebox queue, set top song to "next"
  if (!jukeboxNext && jukeboxTop) {
    jukeboxNext = await Plays.findOneAndUpdate(
      { playId: jukeboxTop.playId },
      { status: 'next' },
      { new: true },
    );
  }

  console.log(
    'jukebox next:',
    jukeboxNext?.songName,
    ', jukebox top:',
    jukeboxTop?.songName,
  );

  // reset
  //   clear spotify queue
  //   change all "next" to "played"
  //   change top song to "next"
  //   play new "next"

  // add song to spotify queue
  console.log('spotify:', spotifyNext.name, 'jukebox:', jukeboxTop?.songName);
  console.log(
    'currentSpotify:',
    spotifyCurrent.name,
    'jukebox:',
    jukeboxTop?.songName,
  );

  //check if currently playing is "next" on jukebox
  // if so,
  // update status of "next" song to "played"
  // check if next song is in spotify queue
  // queue next song, update status of top song in queue to "next"

  if (spotifyCurrent && spotifyCurrent.id === jukeboxNext?.songId) {
    // update status of playing song to "played"
    const playedSong = await Plays.findOneAndUpdate(
      { playId: jukeboxNext.playId },
      { status: 'played' },
      { new: true },
    );

    // // queue next song
    // const addResult = await addTrackToSpotifyQueue(`spotify:track:${jukeboxTop?.songId}`, deviceId, accessToken)

    // update status of top song in queue to "next"
    jukeboxNext = await Plays.findOneAndUpdate(
      { playId: jukeboxTop.playId },
      { status: 'next' },
      { new: true },
    );
    console.log({
      message: 'Queue updated',
      playingSong: playedSong?.songName,
      nextSong: jukeboxNext?.songName,
    });
  } else {
    console.log({
      message: 'Queue Unchanged',
      playingSong: spotifyCurrent.name,
      nextSong: jukeboxNext?.songName,
    });
  }

  if (spotifyNext && spotifyNext.id !== jukeboxNext?.songId) {
    console.log('ADDING SONG', jukeboxNext?.songName);
    const addResult = await addTrackToSpotifyQueue(
      `spotify:track:${jukeboxNext?.songId}`,
      deviceId,
      accessToken,
    );

    console.log('added song', addResult.statusText, jukeboxTop?.songName);
    return { message: 'Queue updated', addResult, spotifyNext, jukeboxTop };
  }
};
const startQueue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken, deviceId, shortName } = req.body;
  // get the "up next" song
  const host: Host = await Hosts.findOne({ shortName: shortName }).catch(e => {
    console.error(e);
    throw new Error(e);
  });

  const nextSong = await Plays.findOne(
    { hostId: host.hostId, status: 'next' },
    {},
    { new: true },
  );
  if (nextSong) {
    await clearSpotifyQueue(deviceId, accessToken);
    const result = await startSpotifyQueue(
      `spotify:track:${nextSong?.songId}`,
      deviceId,
      accessToken,
    );
    await Plays.findOneAndUpdate(
      { playId: nextSong.playId },
      { status: 'played' },
      { new: true },
    );
  }
};

const deleteQueue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { songId, accessToken, deviceId } = req.body;
  const result = await clearSpotifyQueue(deviceId, accessToken);
  return result;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const { shortName, _limit, userId } = req.query;
      const sortedPlays = await getQueue(
        shortName as string,
        _limit as string,
        userId as string,
      );
      return res.status(200).json({ success: true, queue: sortedPlays });
    } else if (req.method === 'POST') {
      // will poll during playback
      const result = await addNextSong(req, res);
      return res.status(200).json({ success: true, queue: result });
    } else if (req.method === 'PUT') {
      // hits on page load to start queue
      const result = await startQueue(req, res);
      return res.status(200).json({ success: true, queue: result });
    } else if (req.method === 'DELETE') {
      const result = await deleteQueue(req, res);
      return res.status(200).json({ success: true, queue: result });
    }

    // Use "next=true" query param to toggle updating the queue
    // if (next === 'true') {
    // if (false) {
    //   // Grab first play obj in queue => play obj w/ highest runningTotal and oldest timestamp
    //   const winner = sortedPlays[0];
    //   // Query Plays: Get leading play object from db and update status to "next"
    //   // Since playId is a globally unique cuid, should return 1 play obj
    //   const play: Play = await Plays.findOneAndUpdate(
    //     { playId: winner.playId },
    //     { $set: { status: 'next' } },
    //   ).catch(e => {
    //     console.error(e);
    //     throw new MongoError(e);
    //   });

    //   // If nothing returned, then nothing was updated and thus nothing was found, return error
    //   if (!play)
    //     return res.status(404).json({
    //       success: false,
    //       message: `No Play found for host with that playId!`,
    //     });

    //   // Query Plays: Get all Play objects where hostId = host.hostId
    //   // Include all statuses, sort by highest runningTotal and oldest queueTimestamp if ties occur
    //   sortedPlays = await Plays.find(
    //     { hostId: host.hostId },
    //     {},
    //     { options: { limit: limit } },
    //   )
    //     .sort({ runningTotal: -1, queueTimestamp: 1 })
    //     .catch(e => {
    //       console.error(e);
    //       throw new MongoError(e);
    //     });
    //   // If no Plays exist with that hostId, somethings wrong, return error
    //   if (sortedPlays.length === 0)
    //     return res.status(404).json({
    //       success: false,
    //       message: `No Plays found for host!`,
    //     });
    // }
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(withJukebox(handler));
