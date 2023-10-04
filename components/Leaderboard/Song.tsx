import { SongObject } from '../../pages/[slug]/queue';
import { User } from '../../models/User';
import QueueSong from '../QueueSong';

const cleanBidders = (bidders: User[]): User[] => {
  const seen = new Map<string, User>();
  bidders.forEach(bid =>
    bid.userId in seen ? null : seen.set(bid.userId, bid),
  );
  return Array.from(seen.values());
};

const cleanSong = (song: SongObject): SongObject => {
  song.bidders = cleanBidders(song.bidders);
  return song;
};

export const Song = ({ song }: { song: SongObject }) => {
  return (
    <>
      <QueueSong song={cleanSong(song)} />
    </>
  );
};
