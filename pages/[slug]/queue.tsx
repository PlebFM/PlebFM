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
export const cleanSong = (
  rawSong: { obj: any; song: any },
  userProfile: User,
): SongObject => {
  const { obj, song } = rawSong;
  const bidders = obj.bids.map((x: any) => x.user);
  const totalAmount = obj.bids.reduce(
    (x: number, bid: Bid) => x + bid.bidAmount,
    0,
  );
  const totalBid = (totalAmount * 1000.0 * 60) / song.duration_ms;
  const myPick = bidders.some((x: User) => x.userId === userProfile.userId);
  return {
    trackTitle: song.name,
    artistName: song.artists[0].name,
    feeRate: totalBid,
    playing: obj.status === 'playing',
    myPick,
    upNext: obj.status === 'next',
    bidders,
    queued: obj.status === 'queued',
    status: obj.status,
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
  const promises = res.data.map((x: any) => {
    const res = fetchSong(x.songId, host).then(song => {
      return { obj: x, song: song };
    });
    return res;
  });
  const raw_songs = await Promise.all(promises);
  const songs = raw_songs.map(x => cleanSong(x, user));
  songs.sort((a, b) => {
    return b.feeRate - a.feeRate;
  });
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
