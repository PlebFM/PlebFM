import React, { useState, useEffect } from 'react';
import Button from '../Utils/Button';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import { transferPlayback } from '../../lib/spotify';
import { useSpotifyPlayback } from '../hooks/useSpotifyPlayback';

interface WebPlaybackProps {
  token: string;
  shortName: string;
  refreshQueue: () => void;
}

function WebPlayback({ token, shortName, refreshQueue }: WebPlaybackProps) {
  const {
    isPaused,
    trackDuration,
    trackPosition,
    isActive,
    player,
    deviceId,
    browserDeviceId,
    track,
  } = useSpotifyPlayback({ token, shortName, refreshQueue });

  if (!isActive && !track?.name) {
    return (
      <div className="text-3xl p-8 flex flex-col space-y-6 mb-8 h-screen">
        Instance not active. Transfer your playback using your Spotify app, or
        click the button below.
        <div className="flex flex-col space-y-2 mt-6">
          {/* Transfer playback to PlebFM  */}
          <Button
            size={'small'}
            onClick={() => {
              player?.activateElement();
              transferPlayback(browserDeviceId, token);
              console.log('transferPlayback called');
            }}
          >
            Transfer playback to PlebFM
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <div className="text-3xl h-full flex flex-col space-y-6 justify-end">
          {/* Album Art */}
          <div className="text-left p-6 pb-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track?.album?.images?.[0]?.url}
              className="absolute top-0 left-0 w-full h-full object-cover blur-xl scale-125"
              alt={track?.name + ' album art'}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track?.album?.images?.[0]?.url}
              className="w-[230px] h-auto relative z-50 drop-shadow-2xl"
              alt={track?.name + ' album art'}
            />
          </div>

          {/* Wrapper */}
          <div className="flex flex-col space-y-6 p-6 relative z-50 bg-gradient-to-b from-black/0 to-black/50">
            {/* Track Info */}
            <div>
              <p className="mb-0">{track?.name}</p>
              <p className="font-bold mb-">{track?.artists?.[0]?.name}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 h-2 rounded-full drop-shadow relative">
              <div
                className="bg-pfm-orange-500 h-full rounded-full rounded-r-none"
                style={{
                  width:
                    ((trackPosition ?? 0) / (trackDuration ?? 1)) * 100 + '%',
                }}
              ></div>
              <div
                className="w-4 h-4 bg-pfm-orange-800 rounded-full absolute -top-1 drop-shadow"
                style={{
                  left:
                    ((trackPosition ?? 0) / (trackDuration ?? 1)) * 100 -
                    1.5 +
                    '%',
                }}
              ></div>
            </div>

            {/* Playback Controls */}
            {!isActive && (
              <div className="flex flex-col space-y-2 text-lg gap-2">
                Playing on another device
                <Button
                  size={'small'}
                  onClick={() => {
                    player?.activateElement();
                    transferPlayback(browserDeviceId, token);
                    console.log('transferPlayback called');
                  }}
                >
                  Transfer playback to PlebFM
                </Button>
              </div>
            )}
            <div className="flex flex-row space-x-2 items-center">
              <Button
                className="btn-spotify"
                size="small"
                icon={<BackwardIcon />}
                iconOnly={true}
                onClick={() => {
                  if (player) player.previousTrack();
                }}
              >
                Previous Song
              </Button>

              <Button
                className="btn-spotify"
                size="small"
                icon={isPaused ? <PlayIcon /> : <PauseIcon />}
                onClick={() => {
                  if (player) player.togglePlay();
                  else console.log('play');
                }}
                iconOnly={true}
              >
                {isPaused ? 'Play' : 'Pause'}
              </Button>

              <Button
                className="btn-spotify"
                size="small"
                icon={<ForwardIcon />}
                iconOnly={true}
                onClick={() => {
                  if (player) {
                    player.nextTrack();
                  }
                }}
              >
                Next Song
              </Button>
              {trackPosition && trackDuration ? (
                <p className="text-sm pl-4">
                  {Math.floor(trackPosition / 1000 / 60)
                    .toString()
                    .padStart(2, '0')}{' '}
                  :{' '}
                  {(Math.floor(trackPosition / 1000) % 60)
                    .toString()
                    .padStart(2, '0')}{' '}
                  {'  /  '}
                  {Math.floor(trackDuration / 1000 / 60)
                    .toString()
                    .padStart(2, '0')}{' '}
                  :{' '}
                  {(Math.floor(trackDuration / 1000) % 60)
                    .toString()
                    .padStart(2, '0')}
                </p>
              ) : (
                <p className="text-sm">0:00 / 0:00</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default WebPlayback;
