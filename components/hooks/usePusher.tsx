import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

export const usePusher = (refreshQueue: () => void) => {
  // const [notifications, setNotifications] = useState<any[]>(sampleNotifications);
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!;

    console.log(appKey, cluster);
    const pusher = new Pusher(appKey, {
      cluster: cluster,
    });
    const channelName = process.env.NEXT_PUBLIC_PUSHER_CHANNEL!;
    const channel = pusher.subscribe(channelName);
    channel.bind('bid', (data: any) => {
      console.log('BID RECEIVED', data);
      // setNotifications(prev => [...prev.filter(notification => parseInt(notification?.bid?.timestamp) + 5_000 < Date.now()), data]);
      setNotifications(prev => [...prev, data]);
      refreshQueue();
    });

    channel.bind('pusher:cache_miss', (data: any) => {
      console.log('MISSED CACHE', data);
    });

    channel.bind_global((eventName: string, data: any) => {
      console.log('PUSHER GLOBAL', eventName, data);
    });

    return () => {
      pusher.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, []);

  return { notifications };
};
