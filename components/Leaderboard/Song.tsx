import { useEffect, useState } from 'react';
import { SongObject } from '../../pages/[slug]/queue';
import Avatar from '../Utils/Avatar';
import Tag from '../Utils/Tag';
import { User } from '../../models/User';
import QueueSong from '../QueueSong';

const cleanBidders = (bidders: User[]): User[] => {
  const seen = new Map<string, User>();
  bidders.forEach(bid =>
    bid.userId in seen ? null : seen.set(bid.userId, bid),
  );
  return Array.from(seen.values());
};
export const Song = ({ song }: { song: SongObject }) => {
  return (
    <>
      <QueueSong song={song} />
    </>
  );
};
