import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { findHost } from '../../utils/host';
import { getLeaderboardQueue, SongObject } from '../../utils/songs';

export const useLeaderboard = () => {
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
    getLeaderboardQueue(host).then(res => {
      if (res) setQueueData(res);
    });
    setRefreshQueue(false);
  }, [host, refreshQueue]);

  const refresh = useCallback(() => {
    setRefreshQueue(true);
  }, []);

  return { queueData, refresh, session, host };
};
