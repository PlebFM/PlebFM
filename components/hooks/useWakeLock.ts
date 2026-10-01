import { useEffect, useState } from 'react';

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        setIsActive(true);
      } catch (err) {
        console.log('Wake Lock error:', err);
        setIsActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      } else {
        setIsActive(false);
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
        setIsActive(false);
      }
    };
  }, []);

  return isActive;
}
