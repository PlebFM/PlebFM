// User profile
import Image from 'next/image';
import Avatar from '../../components/Utils/Avatar';
import React, { useState, useEffect } from 'react';
import Tag from '../../components/Utils/Tag';
import NavBar from '../../components/Utils/NavBar';
import Layout from '../../components/Utils/Layout';
import { SongObject, cleanSong, fetchSong, getQueue } from '../[slug]/queue';
import { User } from '../../models/User';
import { Spinner } from '../../components/Utils/LoadingSpinner';
import { usePathname } from 'next/navigation';
import { usePusher } from '../../components/hooks/usePusher';

export default function UserProfile() {
  const [userProfile, setUserProfile] = useState({
    firstNym: '',
    lastNym: '',
    color: '',
  });
  const [refreshQueue, setRefreshQueue] = useState<boolean>(true);
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  usePusher(() => setRefreshQueue(true));

  const getUserProfileFromLocal = () => {
    const userProfileJSON = localStorage.getItem('userProfile');
    if (userProfileJSON) {
      setUserProfile(JSON.parse(userProfileJSON));
    }
  };

  useEffect(() => {
    setLoading(true);
    getUserProfileFromLocal();
  }, []);

  useEffect(() => {
    if (!userProfile || !pathname || !refreshQueue) return;
    const host = pathname.substring(1).split('/')[0];
    getQueue(host, userProfile as User, true)
      .then(res => {
        if (res) {
          const queued = res.filter(x => x.queued);
          const played = res.filter(x => x.status === 'played');
          setQueueData(queued);
          setQueueDataPlayed(played);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
    setRefreshQueue(false);
  }, [userProfile, pathname, refreshQueue]);

  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [queueDataPlayed, setQueueDataPlayed] = useState<SongObject[]>([]);

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
              {song.bidders.slice(0, 5).map((bidder, key) => (
                <div className="w-8" key={key}>
                  <Avatar
                    firstNym={bidder.firstNym}
                    lastNym={bidder.lastNym}
                    color={bidder.color}
                    size="xs"
                  />
                </div>
              ))}
              {song.bidders.length > 5 ? (
                <div className="pl-4 font-semibold text-lg">
                  +{song.bidders.length - 5}
                </div>
              ) : (
                ``
              )}
            </div>
          </div>
          <div>
            <p className="font-normal text-6xl text-center">
              {song.feeRate.toFixed(0)}
            </p>
            <p className="font-bold text-xs text-center"> sats / min</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Your Profile">
      <>
        <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
          <Image
            src={`/Avatar/${userProfile.lastNym}.png`}
            alt={`${userProfile.firstNym} ${userProfile.lastNym}`}
            width="100"
            height="100"
            className="object-cover w-full h-full blur-2xl opacity-75"
          />
        </div>

        <div className="max-w-screen-md m-auto px-0 py-12 pb-0 text-white relative z-50 flex flex-col space-y-6 items-center font-thin">
          <div className="mx-auto flex flex-col space-y-4 text-center">
            <Avatar
              firstNym={userProfile.firstNym}
              lastNym={userProfile.lastNym}
              color={userProfile.color}
            />
            <p className="text-2xl">
              {userProfile.firstNym
                ? userProfile.firstNym + ' ' + userProfile.lastNym
                : '- - -'}
            </p>
          </div>
          {queueData.length > 0 && (
            <h2 className="text-left font-bold w-full px-6">In Queue</h2>
          )}
          <div className="w-full pb-16 text-white relative z-50 flex flex-col items-center font-thin">
            {queueData.map((song, key) => (
              <Song song={song} key={key} />
            ))}
          </div>

          {loading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner />
            </div>
          ) : queueDataPlayed.length ? (
            <>
              <h2 className="text-left font-bold w-full px-6">
                Already played
              </h2>
              <div className="w-full pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
                {queueDataPlayed.map((song, key) => (
                  <Song song={song} key={key} />
                ))}
              </div>
            </>
          ) : (
            <div className="h-5" />
          )}
        </div>
      </>
      <NavBar activeBtn="profile" />
    </Layout>
  );
}
