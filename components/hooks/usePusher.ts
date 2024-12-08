import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { User } from '../../models/User';

const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!;
const channelId = process.env.NEXT_PUBLIC_PUSHER_CHANNEL!;

export type Notification =
  | {
      message: string;
      user: User;
    }
  | string;

export const usePusher = (refreshQueue: () => void, jukeboxName = '') => {
  // const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const pusher = new Pusher(appKey, {
      cluster: cluster,
    });
    const channelName = `${channelId}-${jukeboxName}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('bid', (data: any) => {
      if (typeof data === 'string') {
        setNotifications(prev => [...prev, data]);
        refreshQueue();
      } else {
        const prefix = data?.isBoost ? ' boosted ' : ' bid on ';
        const message = `${prefix} ${data?.song?.songName} by ${data?.song?.songArtist}`;
        data.message = message;
        setNotifications(prev => [...prev, data]);
        refreshQueue();
      }
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
  }, [jukeboxName, refreshQueue]);

  return { notifications };
};
