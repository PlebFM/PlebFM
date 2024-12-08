import Pusher from 'pusher';
import { User } from '../models/User';
import { Bid } from '../models/Bid';
import { Play } from '../models/Play';

const client = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export const triggerBid = async (
  user: User,
  song: Play,
  bid: Bid,
  isBoost: boolean = false,
  hostId: string,
) => {
  const channelName = `${process.env.NEXT_PUBLIC_PUSHER_CHANNEL!}-${hostId}`;
  console.log('triggering', channelName, 'bid');
  await client.trigger(channelName, 'bid', { user, song, bid, isBoost });
};

export default client;
