import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfileFromLocal } from '../../utils/profile';
import { getQueue, SongObject } from '../../utils/songs';

export const useQueue = (isProfile: boolean = false) => {
  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !isRefreshingQueue) return;
    setLoading(true);
    const userProfile = getUserProfileFromLocal();
    const hostname = pathname.substring(1).split('/')[0];
    getQueue(hostname, userProfile, isProfile).then(res => {
      if (res) setQueueData(res);
      setLoading(false);
    });
    setIsRefreshingQueue(false);
  }, [pathname, isRefreshingQueue, isProfile]);

  return {
    queueData,
    loading,
    refreshQueue: () => setIsRefreshingQueue(true),
  };
};
