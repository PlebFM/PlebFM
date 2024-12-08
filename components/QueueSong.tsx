import Tag from './Utils/Tag';
import Avatar from './Utils/Avatar';
import React from 'react';
import { SongObject } from '../utils/songs';

// TODO: Replace things like trackTitle with song.trackTitle

interface QueueSongProps {
  song: SongObject;
  boosted?: boolean;
}

export default function QueueSong(props: QueueSongProps) {
  const [boostFXPlayed, setBoostFXPlayed] = React.useState(false);

  if (props.boosted) {
    let boostFXTimer = setTimeout(() => {
      setBoostFXPlayed(true);
      console.log('boost FX played');
      clearTimeout(boostFXTimer);
    }, 2000);
  }

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
      {props.boosted && !boostFXPlayed ? (
        <>
          <div className="text-white">
            <svg
              viewBox="0 0 1200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full absolute -top-[25%] left-0 opacity-75"
            >
              <path
                d="M4 20C43.3333 41.6667 116 90.8 124 114L272 196C293.667 177 348.8 139.2 396 128L460 60H636L735 4L819 87C818.667 109 828.4 161.8 870 197C887 185.333 934.6 158.6 989 145C1043.4 131.4 1057 150.667 1057 162L1196 20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="800,1500"
                strokeDashoffset={800}
                className="animate-lightning-draw-1"
              />
            </svg>
            <svg
              viewBox="0 0 1200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full absolute -top-[25%] left-0 opacity-50"
            >
              <path
                d="M1196 180C1207.5 156.5 1086 116.8 1094 140L1054 196L994 4C990.666 29.3333 970.8 83.9995 918 83.9995C865.2 83.9995 806.666 62.6661 784 51.9995L692 196C689.333 174 675.2 130.799 640 109.999L584 140C561 117 505.399 61.3995 466.999 22.9995C428.599 -15.4005 397 26.3328 386 51.9995L294 4L178 196L146 109.999L4 196"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="800,1850"
                strokeDashoffset={800}
                className="animate-lightning-draw-2"
              />
            </svg>
          </div>
          <audio autoPlay>
            <source src="/electricity.mp3" type="audio/mpeg" />
          </audio>
        </>
      ) : (
        ``
      )}
    </div>
  );
}
