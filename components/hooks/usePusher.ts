'use client';

import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { User } from '../../models/User';

const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!;
const channelId = process.env.NEXT_PUBLIC_PUSHER_CHANNEL!;

const pusher = new Pusher(appKey, { cluster });

export type Notification = {
  message: string;
  user: User;
};

export const usePusher = (refreshQueue: () => void, jukeboxName = '') => {
  // const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const channelName = `${channelId}-${jukeboxName}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('bid', (data: any) => {
      if (typeof data === 'string') {
        // refreshQueue();
      } else {
        const prefix = data?.isBoost ? ' boosted ' : ' bid on ';
        const message = `${prefix} ${data?.song?.songName} by ${data?.song?.songArtist}`;
        data.message = message;
        setNotifications(prev => [...prev, data]);
        refreshQueue();
      }
    });

    channel.bind('pusher:cache_miss', (data: any) => {
      console.log('Pusher (missed cache)', data);
    });

    // channel.bind_global((eventName: string, data: any) => {
    //   console.log('Pusher (global)', eventName, data);
    // });

    return () => {
      pusher.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [jukeboxName, refreshQueue]);

  return { notifications };
};
