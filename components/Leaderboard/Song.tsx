import { useEffect, useState } from 'react';
import { SongObject } from '../../pages/[slug]/queue';
import Avatar from '../Utils/Avatar';
import Tag from '../Utils/Tag';
import { User } from '../../models/User';

const cleanBidders = (bidders: User[]): User[] => {
  const seen = new Map<string, User>();
  bidders.forEach(bid =>
    bid.userId in seen ? null : seen.set(bid.userId, bid),
  );
  return Array.from(seen.values());
};
export const Song = ({ song }: { song: SongObject }) => {
  return (
    <div className="p-6 border-b border-white/20 w-full">
      <div className="w-full flex justify-between space-x-4 w-full">
        <div className="flex flex-col space-y-2">
          {!song ? (
            '...'
          ) : (
            <>
              <div>
                <p>{song.trackTitle}</p>
                <p className="font-bold">{song.artistName}</p>
              </div>
              <div className="flex -space-x-1 items-center">
                {cleanBidders(song.bidders)
                  .slice(0, 5)
                  .map((bidder, key) => (
                    <div className="w-8" key={key}>
                      <Avatar
                        firstNym={bidder.firstNym}
                        lastNym={bidder.lastNym}
                        color={bidder.color}
                        size="xs"
                      />
                    </div>
                  ))}
                {cleanBidders(song.bidders).length > 5 ? (
                  <div className="pl-4 font-semibold text-lg">
                    +{song.bidders.length - 5}
                  </div>
                ) : (
                  ``
                )}
              </div>
            </>
          )}
        </div>
        {!song ? (
          <></>
        ) : song.upNext ? (
          <Tag song={song} />
        ) : (
          <div>
            <p className="font-normal text-6xl text-center">
              {song.feeRate.toFixed(0)}
            </p>
            <p className="font-bold text-xs text-center"> sats / min</p>
          </div>
        )}
      </div>
    </div>
  );
};
