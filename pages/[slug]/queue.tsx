import Link from 'next/link';
import Image from 'next/image';
import bokeh3 from '../../public/pfm-bokeh-3.jpg';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import Avatar from '../../components/Avatar';
import Tag from '../../components/Tag';
import querystring from 'querystring';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User } from '../../models/User';
import { Song } from '../../models/Song';
import Layout from '../../components/Layout';
import { Bid } from '../../models/Bid';

// pleb.fm/bantam/queue
// Used for frontend hydration
export type SongObject = {
  trackTitle: string;
  artistName: string;
  feeRate: number;
  playing: boolean;
  myPick: boolean;
  upNext: boolean;
  bidders: User[];
};
const fetchSong = async (songId: string, shortName: string): Promise<Song> => {
  const queryString = new URLSearchParams({
    id: songId,
    shortName: shortName,
  });
  const res = await fetch(`/api/spotify/getSong?${queryString}`, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
  if (!res.ok) throw new Error('Failed to search song');
  const result = await res.json();
  // console.log('FETCH RES', result)
  return result;
};
const cleanSong = (rawSong: { obj: any; song: any }, userProfile: User) => {
  const { obj, song } = rawSong;
  const bidders = obj.bids.map((x: any) => x.user);
  console.log(bidders);
  const totalBid = (obj.runningTotal * 1000.0 * 60) / song.duration_ms;
  const myPick = bidders.some((x: User) => x.userId === userProfile.userId);
  return {
    trackTitle: song.name,
    artistName: song.artists[0].name,
    feeRate: totalBid,
    playing: false,
    myPick,
    upNext: obj.status === 'next',
    bidders,
  };
};
const getQueue = async user => {
  const url = `/api/leaderboard/queue?hostShortName=atl`;
  const response = await fetch(url);
  const res = await response.json();
  if (!res?.queue) {
    return [];
  }
  const promises = res.queue.map((x: any) => {
    const res = fetchSong(x.songId, 'atl').then(song => {
      return { obj: x, song: song };
    });
    return res;
  });
  const raw_songs = await Promise.all(promises);
  const songs = raw_songs.map(x => cleanSong(x, user));
  return songs;
};

export default function Queue() {
  const dummyData = [
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 100,
      playing: true,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 98,
      playing: false,
      upNext: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 87,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 76,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 65,
      playing: false,
      upNext: false,
      myPick: true,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Zazzy',
          lastNym: 'Fawkes',
          color: 'orange',
        },
        {
          firstNym: 'Squealing',
          lastNym: 'Kitty',
          color: 'purpleLight',
        },
        {
          firstNym: 'Silent',
          lastNym: 'Bankasaurus',
          color: 'purpleDark',
        },
        {
          firstNym: 'Insidious',
          lastNym: 'Goldbug',
          color: 'tealLight',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 54,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 43,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 32,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 21,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
    {
      trackTitle: 'Bitcoin ipsum dolor sit amet',
      artistName: 'Nonce inputs',
      feeRate: 10,
      playing: false,
      upNext: false,
      bidders: [
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
        {
          firstNym: 'Fluffy',
          lastNym: 'Honeybadger',
          color: 'teal',
        },
      ],
    },
  ];

  const getUserProfileFromLocal = () => {
    const userProfileJSON = localStorage.getItem('userProfile');
    if (userProfileJSON) {
      return JSON.parse(userProfileJSON);
    }
  };
  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const userProfile = getUserProfileFromLocal();
    getQueue(userProfile).then(res => {
      if (res) setQueueData(res);
      setLoading(false);
    });
  }, []);

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

  const Song = ({ song }: { song: SongObject }) => {
    return (
      <div className="p-6 border-b border-white/20 w-full">
        <Tag song={song} />
        <div className="w-full flex justify-between space-x-4 w-full">
          <div className="flex flex-col space-y-2">
            <div>
              <p>{song.trackTitle}</p>
              <p className="font-bold">{song.artistName}</p>
            </div>
            <div className="flex -space-x-1 items-center">
              {/* TODO: Add fetching of user object for bids using SWR */}
              {song.bidders.length == 0 ? (
                <p></p>
              ) : (
                (song.bidders.length > 5
                  ? song.bidders.slice(0, 5)
                  : song.bidders
                ).map((bidder, key) => (
                  <div className="w-8" key={key}>
                    <Avatar
                      firstNym={bidder.firstNym}
                      lastNym={bidder.lastNym}
                      color={bidder.color}
                      size="xs"
                    />
                  </div>
                ))
              )}
              {song.bidders.length > 5 ? (
                <div className="pl-4 font-semibold text-lg">
                  +{song.bidders.length - 5}
                </div>
              ) : (
                ``
              )}
            </div>
          </div>
          <p className="font-bold">{song.feeRate.toFixed(2)} sats / min</p>
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
        <div className="pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
          {queueData.map((song, key) => (
            <Song song={song} key={key} />
          ))}
        </div>
      )}

      <NavBar activeBtn="queue" />
    </Layout>
  );
}
