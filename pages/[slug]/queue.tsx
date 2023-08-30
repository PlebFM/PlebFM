import Image from 'next/image';
import bokeh3 from '../../public/pfm-bokeh-3.jpg';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import QueueSong from '../../components/QueueSong';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User } from '../../models/User';
import { Song } from '../../models/Song';
import Layout from '../../components/Layout';
import { usePathname } from 'next/navigation';
import { Bid } from '../../models/Bid';
import { Play } from '../../models/Play';

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
export const cleanSong = (song: Play, user: User) => {
  const bidders = song.bids.map((x: Bid) => x.user);
  const totalBid = song.runningTotal;
  const myPick = bidders.some((x: User) => x.userId === user.userId);
  return {
    trackTitle: song.songName,
    artistName: song.songArtist,
    feeRate: totalBid,
    playing: song.status === 'playing',
    myPick,
    upNext: song.status === 'next',
    bidders,
    queued: song.status === 'queued',
    status: song.status,
  };
};

export const getQueue = async (
  host: string,
  user: User,
  isProfile: boolean = false,
) => {
  let url = `/api/leaderboard/queue?shortName=${host}`;
  if (isProfile) {
    url += `&userId=${user.userId}`;
  }
  const response = await fetch(url);
  const res = await response.json();
  if (!res?.data) {
    return [];
  }
  const songs = res.data.map(cleanSong);
  return songs;
};

export default function Queue() {
  const getUserProfileFromLocal = () => {
    const userProfileJSON = localStorage.getItem('userProfile');
    if (userProfileJSON) {
      return JSON.parse(userProfileJSON);
    }
  };
  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    setLoading(true);
    const userProfile = getUserProfileFromLocal();
    const hostname = pathname.substring(1).split('/')[0];
    getQueue(hostname, userProfile).then(res => {
      if (res) setQueueData(res);
      setLoading(false);
    });
  }, [pathname]);

  const EmptyQueue = () => {
    return (
      <div className="pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
        <div className="p-6 border-b border-white/20 w-full">
          <p>
            {' '}
            Queue is currently empty. Bid on a song to see it in the queue!{' '}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Queue">
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={bokeh3}
          alt=""
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : queueData.length === 0 ? (
        <EmptyQueue />
      ) : (
        // <div className="pb-[60px] text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
        <div className="pb-[60px] max-w-screen-sm m-auto pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
          {queueData.map((song, key) => (
            <QueueSong key={key} song={song} />
          ))}
        </div>
      )}

      <NavBar activeBtn="queue" />
    </Layout>
  );
}
