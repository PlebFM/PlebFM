import { signIn } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Host } from '../../models/Host';
import { getLeaderboardQueue, SongObject } from '../../utils/songs';

export const useLeaderboard = ({
  status,
  error,
  shortName,
}: {
  status: string;
  error: string;
  shortName: string;
}) => {
  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [refreshQueue, setRefreshQueue] = useState<boolean>(true);

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     void signIn('spotify');
  //   }
  //   if (status === 'authenticated') {
  //     //@ts-ignore
  //     const spotifyId = session?.user?.id;
  //     if (!spotifyId) return;
  //     findHost(spotifyId).then(host => {
  //       if (!host) {
  //         console.error('HOST NOT FOUND');
  //         redirect('/host?error=host_not_found');
  //       } else {
  //         setHost(host.shortName);
  //       }
  //     });
  //   }
  // }, [status]);

  useEffect(() => {
    if (error === 'RefreshAccessTokenError') {
      signIn('spotify');
    }
  }, [error]);

  useEffect(() => {
    if (!shortName || !refreshQueue) return;
    getLeaderboardQueue(shortName).then(res => {
      if (res) setQueueData(res);
    });
    setRefreshQueue(false);
  }, [shortName, refreshQueue]);

  const refresh = useCallback(() => {
    setRefreshQueue(true);
  }, []);

  return { queueData, refresh };
};
