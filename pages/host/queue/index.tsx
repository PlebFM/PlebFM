import React from 'react';
import Image from 'next/image';
import plebFMLogo from '../../../public/plebfm-logo.svg';
import bokeh4 from '../../../public/pfm-bokeh-4.jpg';
import { getSession } from 'next-auth/react';
import WebPlayback from '../../../components/Leaderboard/SpotifyPlayback';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { Song } from '../../../components/Leaderboard/Song';
import { QR } from '../../../components/Leaderboard/Qr';
import { Notifications } from '../../../components/Leaderboard/Notifications';
import { useLeaderboard } from '../../../components/hooks/useLeaderboard';
import { useWakeLock } from '../../../components/hooks/useWakeLock';
import { useFullscreenControls } from '../../../components/hooks/useFullscreenControls';
import { FloatingControls } from '../../../components/Leaderboard/FloatingControls';

export default function Queue() {
  const { queueData, refresh, session, host } = useLeaderboard();
  useWakeLock();
  const { isFullscreen, showControls, toggleFullscreen } =
    useFullscreenControls();

  return (
    <>
      <Head>
        <title>PlebFM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>
      <div className={`${!showControls ? 'cursor-none' : ''}`}>
        <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
          <Image
            src={bokeh4}
            alt=""
            width="100"
            className="object-cover w-full h-full blur-2xl opacity-75"
          />
        </div>

        <FloatingControls
          showControls={showControls}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        <div className="flex flex-row w-full h-screen justify-between relative z-[99] overflow-hidden">
          <div className="w-1/2 h-full text-white flex flex-col justify-between">
            <div className="text-3xl flex flex-col space-y-4 h-screen">
              <div className="w-full flex flex-row p-6 justify-between relative z-20 bg-gradient-to-b from-black/75 to-black/0">
                <Image
                  src={plebFMLogo}
                  alt="PlebFM"
                  className="m-0 w-full max-w-sm basis-2/3"
                />
                <div className="flex flex-col justify-end items-end">
                  <p className="text-base m-auto w-full text-center my-0">
                    Scan to Bid on songs! {/* at <u>pleb.fm/{host}</u> */}
                  </p>
                  <QR shortName={host ?? 'atl'} />
                  <p className="text-base m-auto font-bold">
                    pleb.fm/{host ?? ''}
                  </p>
                </div>
              </div>

              <div className="relative z-20">
                <Notifications refreshQueue={refresh} host={host ?? ''} />
              </div>

              {session?.accessToken && host && (
                <WebPlayback
                  shortName={host}
                  refreshQueue={refresh}
                  token={session.accessToken}
                />
              )}
            </div>
          </div>
          <div className="w-1/2 h-full overflow-y-scroll">
            <div className="text-white relative z-1 flex flex-col items-center min-h-screen font-thin bg-pfm-purple-300/50">
              {queueData.map((song, key) => (
                <Song song={song} key={key} />
              ))}
              {queueData.length === 0 && (
                <p className="m-10">
                  Queue is Empty! Place a bid on a song at <b>pleb.fm/{host}</b>
                </p>
              )}
            </div>
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
