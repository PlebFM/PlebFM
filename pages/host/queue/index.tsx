import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import bokeh4 from '../../../public/pfm-bokeh-4.jpg';
import Tag from '../../../components/Tag';
import Avatar from '../../../components/Avatar';
import qr from '../../../public/qr.png';
import { feed, dummyData } from '../../../data/dummy.data1.js';
import { getSession, useSession } from 'next-auth/react';
import WebPlayback from '../../../components/SpotifyPlayback';
import { GetServerSidePropsContext } from 'next';

export default function Queue() {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [queueData, setQueueData] = useState(dummyData);
  const [songProgress, setSongProgress] = useState(0.1);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (!session) return;
    const foo = async () => {
      //@ts-ignore
      const accessToken = session.accessToken ?? '';
      if (!accessToken) console.warn('ACCESS TOKEN MISSING FOR SPOTIFY');
      setAccessToken(accessToken);
    };
    foo();
  }, [session]);

  useEffect(() => {
    if (songProgress >= 1) {
      setPaused(true);
    }
    if (paused) {
      return;
    }
    const interval = setInterval(() => {
      setSongProgress(songProgress + 0.01);
    }, 1000);

    return () => clearInterval(interval);
  }, [songProgress, paused]);

  useEffect(() => {}, [songProgress]);

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={bokeh4}
          alt=""
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-75"
        />
      </div>

      <div className="flex flex-row w-full h-screen justify-between relative z-[99] overflow-hidden">
        <div className="w-1/2 h-full text-white flex flex-col justify-between">
          <div className="flex flex-row justify-between p-16 pt-0 pr-0">
            <div className="bg-[#e4f1fb] p-4 mt-16 w-[200px] h-[200px] inline mix-blend-multiply rounded-2xl">
              <Image
                src={qr}
                alt="https://pleb.fm/atl"
                width="200"
                height="200"
                className="w-full"
              />
            </div>
            <div className="w-3/5 flex flex-col space-y-2 pr-4 pt-4">
              {feed.map((update, key) => (
                <div
                  key={key}
                  className={
                    'flex space-x-4 justify-start items-center overflow-hidden bg-pfm-purple-400/50 h-12 rounded p-4 animate-fade-out'
                  }
                >
                  <div className="w-12">
                    <Avatar
                      firstNym={update.user.firstNym}
                      lastNym={update.user.lastNym}
                      color={update.user.color}
                      size="xs"
                    />
                  </div>
                  <p className="w-[300%]">
                    <strong>
                      {update.user.firstNym} {update.user.lastNym}
                    </strong>{' '}
                    {update.action}{' '}
                    {(update.song + ' by ' + update.artist).slice(0, 12) +
                      '...'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {accessToken && <WebPlayback token={accessToken} />}
        </div>
        <div className="w-1/2 h-full overflow-y-scroll">
          <div className="text-white relative z-50 flex flex-col items-center min-h-screen font-thin bg-pfm-purple-300/50">
            {queueData.map((song, key) => (
              <div className="p-6 border-b border-white/20 w-full" key={key}>
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
                  {song.upNext ? (
                    <div className="mb-6">
                      <Tag
                        text={song.upNext ? 'Up Next' : ' '}
                        color={song.upNext ? 'teal' : ' '}
                      />
                    </div>
                  ) : (
                    <p className="font-bold">{song.feeRate} sats</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/host',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
