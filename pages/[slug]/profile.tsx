// User profile
import Image from 'next/image';
import Avatar from '../../components/Utils/Avatar';
import React from 'react';
import Tag from '../../components/Utils/Tag';
import NavBar from '../../components/Utils/NavBar';
import Layout from '../../components/Utils/Layout';
import { SongObject } from '../[slug]/queue';
import { Spinner } from '../../components/Utils/LoadingSpinner';
import { usePusher } from '../../components/hooks/usePusher';
import { useProfile } from '../../components/hooks/useProfile';

export default function UserProfile() {
  const { userProfile, queueData, queueDataPlayed, loading, refreshQueue } =
    useProfile();

  usePusher(refreshQueue);

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
          {userProfile && (
            <Image
              src={`/Avatar/${userProfile.lastNym}.png`}
              alt={`${userProfile.firstNym} ${userProfile.lastNym}`}
              width="100"
              height="100"
              className="object-cover w-full h-full blur-2xl opacity-75"
            />
          )}
        </div>

        <div className="max-w-screen-md m-auto px-0 py-12 pb-0 text-white relative z-50 flex flex-col space-y-6 items-center font-thin">
          {userProfile && (
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
          )}
          {queueData && queueData.length > 0 && (
            <h2 className="text-left font-bold w-full px-6">In Queue</h2>
          )}
          <div className="w-full pb-16 text-white relative z-50 flex flex-col items-center font-thin">
            {queueData?.map((song, key) => (
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
