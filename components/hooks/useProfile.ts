import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { User } from '../../models/User';
import { getQueue, SongObject } from '../../pages/[slug]/queue';

export const getUserProfileFromLocal = () => {
  const userProfileJSON = localStorage.getItem('userProfile');
  if (userProfileJSON) {
    return JSON.parse(userProfileJSON);
  }
};

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<User>();
  const [queueData, setQueueData] = useState<SongObject[]>();
  const [queueDataPlayed, setQueueDataPlayed] = useState<SongObject[]>([]);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState(true);
  const pathname = usePathname();
  const host = pathname?.substring(1).split('/')[0] ?? '';

  useEffect(() => {
    const profile = getUserProfileFromLocal();
    if (profile) setUserProfile(profile);
  }, []);

  const refreshQueue = useCallback(async () => {
    setLoading(true);
    setIsRefreshingQueue(true);
    try {
      const res = await getQueue(host, userProfile, true);
      if (res) {
        const queued = res.filter(x => x.queued);
        const played = res.filter(x => x.status === 'played');
        setQueueData(queued);
        setQueueDataPlayed(played);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshingQueue(false);
    }
  }, [host, userProfile]);

  useEffect(() => {
    if (!userProfile || !isRefreshingQueue || !host) return;
    refreshQueue();
  }, [userProfile, isRefreshingQueue, refreshQueue, host]);

  return { userProfile, queueData, queueDataPlayed, loading, refreshQueue };
};
