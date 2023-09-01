'use client';
import Pusher, { Channel } from 'pusher-js';
import { useEffect, useRef, useState } from 'react';

const usePusher = () => {
  const pusher = useRef<Pusher>();
  const bidChannel = useRef<Channel>();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (pusher.current) return;

    const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!;

    console.log(appKey, cluster);
    pusher.current = new Pusher(appKey, {
      cluster: cluster,
    });
    const channel = process.env.NEXT_PUBLIC_PUSHER_CHANNEL!;
    bidChannel.current = pusher.current.subscribe(channel);
    bidChannel.current.bind('bid', (data: any) => {
      console.log('BID RECEIVED', data);
      setNotifications(prev => [...prev, data]);
    });

    bidChannel.current.bind('pusher:cache_miss', (data: any) => {
      console.log('MISSED CACHE', data);
    });

    pusher.current.bind_global((eventName: string, data: any) => {
      console.log('PUSHER GLOBAL', eventName, data);
    });

    return () => {
      pusher.current?.unbind_all();
      pusher.current?.unsubscribe(channel);
    };
  }, []);

  return { notifications };
};

export const Notifications = () => {
  const { notifications } = usePusher();
  useEffect(() => {
    console.log('NOTIFICATIONS', notifications);
  }, [notifications]);
  return (
    <>
      <div className="absolute top-0 right-0">
        hello
        {notifications.map((notification, key) => (
          <div key={key}>hiya, {notification.toString()}</div>
        ))}
      </div>
    </>
  );
};
