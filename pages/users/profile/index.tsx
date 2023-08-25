// User profile
import Image from 'next/image';
import Avatar from '../../../components/Avatar';
import React, { useState, useEffect } from 'react';
import Tag from '../../../components/Tag';
import NavBar from '../../../components/NavBar';
import Layout from '../../../components/Layout';
import { SongObject, cleanSong, fetchSong, getQueue } from '../../[slug]/queue';
import { User } from '../../../models/User';
import LoadingSpinner from '../../../components/LoadingSpinner';
import QueueSong from '../../../components/QueueSong';

export default function UserProfile() {
  const [userProfile, setUserProfile] = useState({
    firstNym: '',
    lastNym: '',
    color: '',
  });
  const [loading, setLoading] = useState(false);

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
    if (!userProfile) return;
    getQueue(userProfile as User, true)
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
  }, [userProfile]);

  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [queueDataPlayed, setQueueDataPlayed] = useState<SongObject[]>([]);

  return (
    <Layout title="Your Profile">
      {loading ? (
        <LoadingSpinner />
      ) : (
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

          <div className="w-full px-0 py-12 pb-0 text-white relative z-50 flex flex-col space-y-6 items-center font-thin">
            <div className="w-2/3 mx-auto flex flex-col space-y-4 text-center">
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
            <div className="w-full text-white relative z-50 flex flex-col items-center font-thin">
              {queueData.map((song, key) => (
                <QueueSong song={song} key={key} />
              ))}
            </div>

            {queueDataPlayed.length ? (
              <>
                <h2 className="text-left font-bold w-full px-6">
                  Already played
                </h2>
                <div className="w-full pb-[60px] text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
                  {queueDataPlayed.map((song, key) => (
                    <QueueSong song={song} key={key} />
                  ))}
                </div>
              </>
            ) : (
              <div className="h-5" />
            )}
          </div>
        </>
      )}
      <NavBar activeBtn="profile" />
    </Layout>
  );
}
