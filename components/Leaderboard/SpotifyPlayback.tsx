import React, { useState, useEffect } from 'react';
import Button from '../Utils/Button';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import { transferPlayback } from '../../lib/spotify';
import { signIn } from 'next-auth/react';

const emptyTrack = {
  name: '',
  album: {
    images: [{ url: '' }],
  },
  artists: [{ name: '' }],
};

interface WebPlaybackProps {
  token: string;
  shortName: string;
  refreshQueue: () => void;
}
const syncJukebox = async (
  accessToken: string,
  shortName: string,
  deviceId: string,
) => {
  let url = `/api/leaderboard/queue`;
  const body = JSON.stringify({
    shortName: shortName,
    accessToken: accessToken,
    deviceId: deviceId,
  });
  const response = await fetch(url, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  const res = await response.json();
  return res;
};

function WebPlayback({ token, shortName, refreshQueue }: WebPlaybackProps) {
  const [isPaused, setPaused] = useState(false);
  const [trackDuration, setDuration] = useState<number>();
  const [trackPosition, setPosition] = useState<number>();
  const [isActive, setActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [deviceId, setDeviceId] = useState('');
  const [track, setTrack] = useState(emptyTrack);

  // progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (!trackPosition) return;
      if (isPaused || !trackDuration || trackPosition >= trackDuration) return;
      setPosition(trackPosition + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, deviceId, setPosition, trackPosition, trackDuration]);

  useEffect(() => {
    const interval = setInterval(() => {
      syncJukebox(token, shortName, deviceId).then(res => {
        if (!res?.data) {
          console.error('failed to sync jukebox', res);
        }
        // if (res.data?.updated) refreshQueue();
        refreshQueue();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [deviceId, shortName, token, refreshQueue]);

  useEffect(() => {
    if (!token) return;
    const existing_script = document.getElementById('spotify-player');
    if (!existing_script) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.id = 'spotify-player';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'PlebFM',
        getOAuthToken: cb => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId('');
      });

      player.on('authentication_error', event => {
        console.error('Failed to authenticate', event.message);
        signIn('spotify', { callbackUrl: '/host/queue' });
      });

      player.addListener('player_state_changed', state => {
        if (!state) return;
        const {
          paused,
          position,
          duration,
          track_window: { current_track },
        } = state;
        console.log('Currently Playing', current_track);
        console.log('Position in Song', position);
        console.log('Duration of Song', duration);
        setPosition(position);
        setDuration(duration);
        setPaused(paused);
        setTrack(current_track);
        player.getCurrentState().then(state => {
          if (state) {
            setActive(true);
            setPosition(state.position);
          } else {
            setActive(false);
          }
        });
      });

      player.connect();
    };
  }, []);

  useEffect(() => {
    if (deviceId && token) {
      transferPlayback(deviceId, token);
    }
  }, [deviceId]);

  if (!isActive || !track) {
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
              transferPlayback(deviceId, token);
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
              src={track.album.images[0].url}
              className="absolute top-0 left-0 w-full h-full object-cover blur-xl scale-125"
              alt={track.name + ' album art'}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track.album.images[0].url}
              className="w-[230px] h-auto relative z-50"
              alt={track.name + ' album art'}
            />
          </div>

          {/* Wrapper */}
          <div className="flex flex-col space-y-6 p-6 relative z-50 bg-gradient-to-b from-black/0 to-black/50">
            {/* Track Info */}
            <div>
              <p className="mb-0">{track.name}</p>
              <p className="font-bold mb-">{track.artists[0].name}</p>
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
