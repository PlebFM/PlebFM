import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import plebFMLogo from '../../../public/plebfm-logo.svg';
import bokeh4 from '../../../public/pfm-bokeh-4.jpg';
import { getSession, signIn, useSession } from 'next-auth/react';
import WebPlayback from '../../../components/Leaderboard/SpotifyPlayback';
import { GetServerSidePropsContext } from 'next';
import { SongObject, fetchSong } from '../../[slug]/queue';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Song } from '../../../components/Leaderboard/Song';
import { Host } from '../../../models/Host';
import { Play } from '../../../models/Play';
import { Bid } from '../../../models/Bid';
import { QR } from '../../../components/Leaderboard/Qr';

const getLeaderboardQueue = async (host: string) => {
  let url = `/api/leaderboard/queue?shortName=${host}`;
  const response = await fetch(url);
  const res = await response.json();
  if (!res?.data) {
    return [];
  }
  const songs = res.data.map(cleanSong);
  return songs;
};

const cleanSong = (song: Play) => {
  const bidders = song.bids.map((x: Bid) => x.user);
  const totalBid = song.runningTotal;
  return {
    trackTitle: song.songName,
    artistName: song.songArtist,
    feeRate: totalBid,
    playing: song.status === 'playing',
    upNext: song.status === 'next',
    bidders,
    queued: song.status === 'queued',
    status: song.status,
  };
};

const findHost = async (spotifyId: string): Promise<Host> => {
  const res = await fetch(`/api/hosts?spotifyId=${spotifyId}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
    },
  });
  const resJson = await res.json();
  return resJson?.hosts[0];
};

export default function Queue() {
  const { data: session, status } = useSession();
  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [refreshQueue, setRefreshQueue] = useState<boolean>(true);
  const [host, setHost] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    if (!router) return;
    if (status === 'unauthenticated') {
      void signIn('spotify');
    }
    if (status === 'authenticated') {
      //@ts-ignore
      const spotifyId = session?.user?.id;
      if (!spotifyId) return;
      findHost(spotifyId).then(host => {
        if (!host) {
          console.error('HOST NOT FOUND');
          router.push('/host?error=host_not_found');
        } else {
          setHost(host.shortName);
        }
      });
    }
  }, [status, session, router]);

  useEffect(() => {
    console.log('Session', session);
    if (session?.error === 'RefreshAccessTokenError') {
      signIn('spotify');
    }
    // const foo = async () => {
    //   console.log(session)
    //   //@ts-ignore
    //   const accessToken = session.accessToken ?? '';
    //   if (!accessToken) console.warn('ACCESS TOKEN MISSING FOR SPOTIFY');
    // };
    // foo();
  }, [session]);

  useEffect(() => {
    if (!host || !refreshQueue) return;
    console.log('refreshing');
    getLeaderboardQueue(host).then(res => {
      if (res) setQueueData(res);
    });
    setRefreshQueue(false);
  }, [host, refreshQueue]);

  return (
    <>
      <Head>
        <title>PlebFM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>
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
          {/*<div className="flex flex-row justify-between p-16 pt-0 pr-0">*/}
          {/*  <div className="bg-[#e4f1fb] p-4 mt-16 w-[200px] h-[200px] inline mix-blend-multiply rounded-2xl">*/}
          {/*    <Image*/}
          {/*      src={qr}*/}
          {/*      alt="https://pleb.fm/atl"*/}
          {/*      width="200"*/}
          {/*      height="200"*/}
          {/*      className="w-full"*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*  <div className="w-3/5 flex flex-col space-y-2 pr-4 pt-4">*/}
          {/*    {feed.map((update, key) => (*/}
          {/*      <div*/}
          {/*        key={key}*/}
          {/*        className={*/}
          {/*          'flex space-x-4 justify-start items-center overflow-hidden bg-pfm-purple-400/50 h-12 rounded p-4 animate-fade-out'*/}
          {/*        }*/}
          {/*      >*/}
          {/*        <div className="w-12">*/}
          {/*          <Avatar*/}
          {/*            firstNym={update.user.firstNym}*/}
          {/*            lastNym={update.user.lastNym}*/}
          {/*            color={update.user.color}*/}
          {/*            size="xs"*/}
          {/*          />*/}
          {/*        </div>*/}
          {/*        <p className="w-[300%]">*/}
          {/*          <strong>*/}
          {/*            {update.user.firstNym} {update.user.lastNym}*/}
          {/*          </strong>{' '}*/}
          {/*          {update.action}{' '}*/}
          {/*          {(update.song + ' by ' + update.artist).slice(0, 12) +*/}
          {/*            '...'}*/}
          {/*        </p>*/}
          {/*      </div>*/}
          {/*    ))}*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="text-3xl p-8 flex flex-col space-y-6">
            <div className="w-2/3 m-auto">
              <Image
                src={plebFMLogo}
                alt="PlebFM"
                className="w-auto mx-auto lg:w-full"
              />
            </div>
            {session?.accessToken && host && (
              <WebPlayback
                shortName={host}
                refreshQueue={() => setRefreshQueue(true)}
                token={session.accessToken}
              />
            )}
            <div className="flex flex-col space-y-2 m-auto justify-center">
              <p className="text-base m-auto">
                Scan to Bid on songs! {/* at <u>pleb.fm/{host}</u> */}
              </p>
              <QR shortName={host ?? 'atl'} />
              <p className="text-lg m-auto font-bold">
                <u>pleb.fm/{host}</u>
              </p>
              {/* Add song to spotify queue */}
              {/* <p className="text-xs">Search result URI: {searchResultURI}</p>
            <Button
              size={'small'}
              onClick={() => {
                addTrackToSpotifyQueue(
                  searchResultURI,
                  deviceId,
                  props.token,
                ).then(res => {
                  if (res.status !== 202)
                    alert('failed adding to spotify queue');
                });
              }}
            >
              Add track
            </Button> */}
            </div>
          </div>
        </div>
        <div className="w-1/2 h-full overflow-y-scroll">
          <div className="text-white relative z-50 flex flex-col items-center min-h-screen font-thin bg-pfm-purple-300/50">
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
