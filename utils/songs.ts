import { User } from '../models/User';
import { Song } from '../models/Song';
import { Bid } from '../models/Bid';
import { Play } from '../models/Play';

// pleb.fm/bantam/queue
// Used for frontend hydration
export type SongObject = {
  trackTitle: string;
  artistName: string;
  feeRate: number;
  playing: boolean;
  myPick?: boolean;
  upNext: boolean;
  bidders: User[];
  queued?: boolean;
  status?: string;
};

export const fetchSong = async (
  songId: string,
  shortName: string,
): Promise<Song> => {
  const queryString = new URLSearchParams({
    id: songId,
    shortName: shortName,
  });
  const res = await fetch(`/api/spotify/getSong?${queryString}`, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
  if (!res.ok) throw new Error('Failed to search song');
  const result = await res.json();
  return result;
};
export const cleanSong = (song: Play, user?: User): SongObject => {
  const bidders = song.bids.map((x: Bid) => x.user);
  const totalBid = song.runningTotal;
  const myPick = user
    ? bidders.some((x: User) => x.userId === user.userId)
    : undefined;
  return {
    trackTitle: song.songName,
    artistName: song.songArtist,
    feeRate: totalBid,
    playing: song.status === 'playing',
    myPick: !!myPick,
    upNext: song.status === 'next',
    bidders,
    queued: song.status === 'queued',
    status: song.status,
  };
};

export const getQueue = async (
  host: string,
  user?: User,
  isProfile: boolean = false,
): Promise<SongObject[]> => {
  let url = `/api/leaderboard/queue?playing=${true}&shortName=${host}`;
  if (isProfile) {
    url += `&userId=${user?.userId}`;
  }
  const response = await fetch(url);
  const res = await response.json();
  if (!res?.data) {
    return [];
  }
  const songs = res.data.map(cleanSong);
  return songs;
};

export const getLeaderboardQueue = async (host: string) => {
  let url = `/api/leaderboard/queue?shortName=${host}`;
  const response = await fetch(url);
  const res = await response.json();
  if (!res?.data) {
    return [];
  }
  const songs = res.data.map(cleanSong);
  return songs;
};
