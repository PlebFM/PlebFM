'use client';

import Tag from './Utils/Tag';
import Avatar from './Utils/Avatar';
import { SongObject } from '../utils/songs';
import dynamic from 'next/dynamic';

// Dynamically import BoostEffects with client-side only rendering
const BoostEffects = dynamic(() => import('./QueueSong/BoostEffects'), {
  ssr: false,
});

// TODO: Replace things like trackTitle with song.trackTitle

interface QueueSongProps {
  song: SongObject;
  boosted?: boolean;
}

export default function QueueSong(props: QueueSongProps) {
  return (
    <div
      className={
        'p-6 border-b border-white/20 w-full bg-pfm-purple-300/50 relative overflow-x-clip overflow-y-visible' +
        (props.boosted ? ' animate-boost-glow-shudder' : '')
      }
    >
      {props.song.playing || props.song.upNext || props.song.myPick ? (
        <div className="mb-2">
          <Tag song={props.song} />
        </div>
      ) : (
        ``
      )}
      <div className="w-full flex justify-between space-x-4">
        {/* {props.song ? <Tag song={props.song} /> : ``} */}
        <div className="flex flex-col space-y-2">
          <div>
            <p className="font-normal">{props.song.trackTitle}</p>
            <p className="font-bold">{props.song.artistName}</p>
          </div>
          <div className="flex -space-x-1 items-center">
            {/* TODO: Add fetching of user object for bids using SWR */}
            {props.song.bidders.length == 0 ? (
              <p>user pics</p>
            ) : (
              (props.song.bidders.length > 5
                ? props.song.bidders.slice(0, 5)
                : props.song.bidders
              ).map((bidder, key) => (
                <div className="w-8" key={key}>
                  <Avatar
                    firstNym={bidder.firstNym}
                    lastNym={bidder.lastNym}
                    color={bidder.color || bidder.avatar}
                    size="xs"
                  />
                </div>
              ))
            )}
            {props.song.bidders.length > 5 ? (
              <div className="pl-4 font-semibold text-lg">
                +{props.song.bidders.length - 5}
              </div>
            ) : (
              ``
            )}
          </div>
        </div>
        {!(props.song.playing || props.song.upNext || props.song.myPick) ? (
          <div>
            <p className="font-extralight text-2xl text-center">
              {props.song.feeRate.toFixed(0)}
            </p>
            <p className="font-bold text-xs text-center"> sats / min</p>
          </div>
        ) : (
          <></>
        )}
      </div>
      {props.boosted && <BoostEffects boosted={true} />}
    </div>
  );
}
