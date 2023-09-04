'use client';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import Avatar from '../Utils/Avatar';
import { usePusher } from '../hooks/usePusher';

const sampleNotifications = [
  {
    user: {
      _id: '63e1ae3039d5a1595ba304f6',
      userId: 'cldtl3mcx00000vn2cvn0brm2',
      firstNym: 'Fluffy',
      lastNym: 'Kitty',
      avatar: 'purpleLight',
      __v: 0,
    },
    song: {
      playId: 'clm537gjr000azkn254rfbrsq',
      hostId: 'nonce33jfkasjkdf',
      songId: '0aym2LBJBk9DAYuHHutrIl',
      status: 'queued',
      bids: [
        {
          bidId: 'clm537gc50009zkn2ac7gh1tt',
          user: {
            _id: '63e1ae3039d5a1595ba304f6',
            userId: 'cldtl3mcx00000vn2cvn0brm2',
            firstNym: 'Fluffy',
            lastNym: 'Kitty',
            avatar: 'purpleLight',
            __v: 0,
          },
          bidAmount: 262,
          timestamp: '1693845052718',
          rHash:
            'c0b540a7397f3e917524b521b7beb7c2405f69d536677464de5549f05af130bd',
        },
      ],
      runningTotal: 36.93149114419492,
      queueTimestamp: '1693844374901',
      songName: 'Hey Jude - Remastered 2015',
      songArtist: 'The Beatles',
      albumUri:
        'https://i.scdn.co/image/ab67616d0000b273582d56ce20fe0146ffa0e5cf',
      songLength: 425.653,
      _id: '64f60397060002765021419d',
      __v: 0,
    },
    bid: {
      bidId: 'clm537gc50009zkn2ac7gh1tt',
      user: {
        _id: '63e1ae3039d5a1595ba304f6',
        userId: 'cldtl3mcx00000vn2cvn0brm2',
        firstNym: 'Fluffy',
        lastNym: 'Kitty',
        avatar: 'purpleLight',
        __v: 0,
      },
      bidAmount: 262,
      timestamp: '1693844374901',
      rHash: 'c0b540a7397f3e917524b521b7beb7c2405f69d536677464de5549f05af130bd',
    },
    isBoost: true,
  },
];

export const Notifications = ({
  refreshQueue,
}: {
  refreshQueue: () => void;
}) => {
  const { notifications } = usePusher(refreshQueue);
  useEffect(() => {
    console.log('NOTIFICATIONS', notifications);
  }, [notifications]);
  return (
    <div className="absolute top-0 left-0">
      <div className="flex flex-row justify-between p-16 pt-0 pr-0">
        {/* <div className="bg-[#e4f1fb] p-4 mt-16 w-[200px] h-[200px] inline mix-blend-multiply rounded-2xl"> */}
        {/* <Image
          src={qr}
          alt="https://pleb.fm/atl"
          width="200"
          height="200"
          className="w-full"
        /> */}
        {/* </div> */}
        <div className="w-full flex flex-col space-y-2 pr-4 pt-4">
          {notifications.map((update, key) => (
            <div
              key={key}
              className={
                'flex space-x-4 justify-start items-center overflow-hidden bg-pfm-purple-400/50 h-12 rounded p-4 animate-fade-out'
                // 'flex space-x-4 justify-start items-center overflow-hidden bg-pfm-purple-400/50 h-12 rounded p-4'
              }
            >
              <div className="w-12">
                <Avatar
                  firstNym={update?.user?.firstNym}
                  lastNym={update?.user?.lastNym}
                  color={update?.user?.color}
                  size="xs"
                />
              </div>
              <p className="w-[300%]">
                <strong>
                  {update?.user?.firstNym} {update?.user?.lastNym}
                </strong>{' '}
                {update?.isBoost ? 'boosted' : 'bid on'}{' '}
                {(
                  update?.song?.songName +
                  ' by ' +
                  update?.song?.songArtist
                ).slice(0, 12) + '...'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
