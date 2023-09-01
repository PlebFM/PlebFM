import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Hosts, { Host } from '../../../models/Host';
import Plays, { Play } from '../../../models/Play';
import withJukebox from '../../../middleware/withJukebox';
import {
  addTrackToSpotifyQueue,
  clearSpotifyQueue,
  getSpotifyQueue,
  getSpotifyRecentlyPlayed,
  startSpotifyQueue,
} from '../../../lib/spotify';

const getQueue = async (
  shortName: string,
  _limit?: string,
  userId?: string,
  includeNext: boolean = true,
  includePlaying: boolean = false,
): Promise<Play[]> => {
  // const { shortName, _limit, userId } = req.query;
  const limit = parseInt((_limit as string) ?? '10');
  if (!shortName) throw new Error('getQueue - Expected query param shortName!');
  // Lookup host by shortname
  const host: Host = await Hosts.findOne({
    shortName: shortName,
  }).catch(e => {
    console.error('hostError', e);
    throw new Error(e);
  });

  // If not host exists, return error

  if (!host) throw new Error('getQueue - No host found for shortName!');
  // Query Plays: Get play objs where hostId = host.hostId & status = queued
  // sort by highest runningTotal and oldest queueTimestamp if ties occur
  const statusFilters = ['queued'];
  if (includeNext) statusFilters.push('next');
  if (includePlaying) statusFilters.push('playing');
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
      console.error('find queue error', e);
      throw new Error(e);
    });

  // Plays.find returns a list of results. If no results found, list will be empty []
  if (sortedPlays.length === 0) return [];

  sortedPlays.sort((a, b) => {
    if (a.status === 'playing') return -1;
    if (b.status === 'playing') return 1;
    if (a.status === 'next') return -1;
    if (b.status === 'next') return 1;
    return b.runningTotal - a.runningTotal;
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
//
// 1. if last played on spotify is "playing" in jukebox...
//   change "playing" to "played"
//
// 2. if currently playing "next" in jukebox...
//   change "next" to "playing"
//
// 3. if nothing is "next" in jukebox...
//   change top to "next"
//
// 4. if spotify next is not "next"
//   add "next" to spotify queue (what if queue isn't empty???? maybe check length?)
const syncJukebox = async (req: NextApiRequest, res: NextApiResponse) => {
  const { shortName, accessToken, deviceId } = req.body;
  let updated = false;
  const host = await Hosts.findOne({ shortName: shortName });
  const _spotifyQueue = await getSpotifyQueue(accessToken);
  if (_spotifyQueue.error) {
    throw new Error(
      `Get Spotify Queue Failed! error: ${JSON.stringify(_spotifyQueue.error)}`,
    );
  }
  const spotifyQueue = _spotifyQueue?.queue;
  const spotifyQueueIds = new Set(
    spotifyQueue?.map((track: { id: string }) => track?.id),
  );
  const spotifyCurrent = _spotifyQueue?.currently_playing;
  const jukeboxQueue = await getQueue(
    shortName,
    undefined,
    undefined,
    false,
    false,
  );
  const jukeboxTop = jukeboxQueue?.[0];
  const jukeboxCurrent = await Plays.findOne({
    status: 'playing',
    hostId: host.hostId,
  }).catch(e => {
    console.error('find song error', e);
    throw new Error(e);
  });
  let jukeboxNext = await Plays.findOne({
    status: 'next',
    hostId: host.hostId,
  }).catch(e => {
    console.error('find song error', e);
    throw new Error(e);
  });
  const spotifyRecent = await getSpotifyRecentlyPlayed(accessToken, 1);
  const spotifyLastPlayed = spotifyRecent?.items?.[0];

  // 1. if last played on spotify is "playing" in jukebox...
  //   change "playing" to "played"

  const spotifyLastPlayedInJuke = await Plays.findOne({
    songId: spotifyLastPlayed?.id,
    status: 'playing',
  });
  // should we NOT clear if we're currently playing it too?
  if (spotifyLastPlayedInJuke && spotifyCurrent?.id !== spotifyLastPlayed?.id) {
    // if (spotifyLastPlayed?.track?.id === jukeboxCurrent.songId) {
    console.log(`updating ${spotifyLastPlayedInJuke.songName} to played`);
    await Plays.findOneAndUpdate(
      { playId: spotifyLastPlayedInJuke.playId },
      { status: 'played' },
      { new: true },
    );

    return { success: true, updated: true };
  }

  // 2. if currently playing "next" in jukebox...
  //   change "next" to "playing"
  else if (spotifyCurrent?.id === jukeboxNext?.songId) {
    console.log(`updating ${jukeboxNext.songName} to playing`);
    await Plays.findOneAndUpdate(
      { playId: jukeboxNext.playId },
      { status: 'playing' },
    );
    return { success: true, updated: true };
  }
  // 3. if nothing is "next" in jukebox...
  //   change top to "next"
  else if (!jukeboxNext && jukeboxTop) {
    jukeboxNext = await Plays.findOneAndUpdate(
      { playId: jukeboxTop.playId },
      { status: 'next' },
      { new: true },
    );
    return { success: true, updated: true };
  }

  // 4. if spotify next is not "next"
  //   add "next" to spotify queue (what if queue isn't empty???? maybe check length?)
  else if (jukeboxNext && !spotifyQueueIds.has(jukeboxNext.songId)) {
    // if (spotifyQueue?.length >= 20) {
    //   console.log('queue full.. not adding', jukeboxNext?.songName);
    //   return { success: true, updated: false };
    // }
    const addResult = await addTrackToSpotifyQueue(
      `spotify:track:${jukeboxNext.songId}`,
      deviceId,
      accessToken,
    );
    console.log('added song', jukeboxNext?.songName, addResult.statusText);
    console.log('queue length', spotifyQueue?.length);
    return { success: true, updated: true };
  }

  return { success: true, updated: false };
};

const startQueue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken, deviceId, shortName } = req.body;
  // get the "up next" song
  const host: Host = await Hosts.findOne({ shortName: shortName }).catch(e => {
    console.error(e);
    throw new Error(e);
  });
  const playingSong = await Plays.findOne(
    { hostId: host.hostId, status: 'playing' },
    {},
    { new: true },
  );
  // If nothing's playing, play money
  const MONEY = 'spotify:track:0vFOzaXqZHahrZp6enQwQb';
  const playingTrack = playingSong
    ? `spotify:track:${playingSong?.songId}`
    : MONEY;
  // PLAY PLAYING SONG
  console.log('playingTrack', playingTrack);
  const spotifyQueue = await getSpotifyQueue(accessToken);
  const spotifyPlaying = spotifyQueue?.currently_playing;
  if (spotifyPlaying?.id !== playingSong.songId) {
    // do nothing if it's the same
    console.log('starting', playingSong.songName);
    const result = await startSpotifyQueue(playingTrack, deviceId, accessToken);
  } else {
    console.log('already playing', playingSong.songName);
  }
  // Old logic for handling next song
  // const nextSong = await Plays.findOne(
  //   { hostId: host.hostId, status: 'next' },
  //   {},
  //   { new: true },
  // );
  // if (nextSong) {
  //   await clearSpotifyQueue(deviceId, accessToken);
  //   const result = await startSpotifyQueue(
  //     `spotify:track:${nextSong?.songId}`,
  //     deviceId,
  //     accessToken,
  //   );
  //   await Plays.findOneAndUpdate(
  //     { playId: nextSong.playId },
  //     { status: 'playing' },
  //     { new: true },
  //   );
  // }
};

const deleteQueue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken, deviceId } = req.body;
  const result = await clearSpotifyQueue(deviceId, accessToken);
  return result;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const {
        shortName,
        _limit,
        userId,
        next = true,
        playing = false,
      } = req.query;
      const sortedPlays = await getQueue(
        shortName as string,
        _limit as string,
        userId as string,
        next as boolean,
        playing as boolean,
      );
      return res.status(200).json({ success: true, data: sortedPlays });
    } else if (req.method === 'POST') {
      // will poll during playback
      const result = await syncJukebox(req, res);
      return res.status(200).json({ success: true, data: result });
    } else if (req.method === 'PUT') {
      // hits on page load to start queue
      const result = await startQueue(req, res);
      return res.status(200).json({ success: true, data: result });
    } else if (req.method === 'DELETE') {
      const result = await deleteQueue(req, res);
      return res.status(200).json({ success: true, data: result });
    }
  } catch (error: any) {
    console.error(error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(withJukebox(handler));
