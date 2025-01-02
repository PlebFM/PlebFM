import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getUserProfileFromLocal } from '../../utils/profile';
import { getQueue, SongObject } from '../../utils/songs';

export const useQueue = (isProfile: boolean = false, host?: string) => {
  const [queueData, setQueueData] = useState<SongObject[]>([]);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const hostname = useMemo(() => {
    if (host) return host;
    else if (pathname) {
      const path = pathname.substring(1).split('/')[0];
      if (path !== 'host') return path;
      return '';
    } else return '';
  }, [pathname, host]);

  useEffect(() => {
    if (!hostname || !isRefreshingQueue) return;
    setLoading(true);
    const userProfile = isProfile ? getUserProfileFromLocal() : null;
    getQueue(hostname, userProfile, isProfile).then(res => {
      if (res) setQueueData(res);
      setLoading(false);
    });
    setIsRefreshingQueue(false);
  }, [isRefreshingQueue, isProfile, hostname]);

  return {
    queueData,
    loading,
    refreshQueue: () => setIsRefreshingQueue(true),
  };
};
