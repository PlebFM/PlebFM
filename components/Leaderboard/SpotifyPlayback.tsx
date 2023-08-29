import React, { useState, useEffect } from 'react';
import Button from '../Button';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import { addTrackToSpotifyQueue, transferPlayback } from '../../lib/spotify';

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
const updateQueue = async (
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

function WebPlayback(props: WebPlaybackProps) {
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

      if (Math.round(trackPosition / 1000) % 5 === 0) {
        updateQueue(props.token, props.shortName, deviceId).then(res => {
          if (res?.data?.updated) {
            console.log('refreshing');
            props.refreshQueue();
          }
        });
      }
      if (isPaused) return;
      setPosition(trackPosition + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, props, deviceId, setPosition, trackPosition]);

  useEffect(() => {
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
          cb(props.token);
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

  useEffect(() => {}, []);

  useEffect(() => {
    if (deviceId) {
      transferPlayback(deviceId, props.token);
    }
  }, [deviceId, props.token]);

  const searchResultURI = 'spotify:track:2rBHnIxbhkMGLpqmsNX91M';

  if (!isActive || !track) {
    return (
      <div className="text-3xl p-16 flex flex-col space-y-6 mb-8">
        Instance not active. Transfer your playback using your Spotify app, or
        click the button below.
        <div className="flex flex-col space-y-2 mt-3">
          {/* Transfer playback to PlebFM  */}
          <Button
            size={'small'}
            onClick={() => {
              // player?.activateElement();
              transferPlayback(deviceId, props.token);
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
        <div className="text-3xl p-8 flex flex-col space-y-6 mb-32">
          <img
            src={track.album.images[0].url}
            className="w-64 h-64"
            alt={track.name + ' album art'}
          />

          <p>{track.name}</p>

          <p className="font-bold">{track.artists[0].name}</p>

          <div className="w-full bg-white/20 h-4 rounded-full drop-shadow relative">
            <div
              className="bg-pfm-orange-500 h-full rounded-full rounded-r-none"
              style={{
                width:
                  ((trackPosition ?? 0) / (trackDuration ?? 1)) * 100 + '%',
              }}
            ></div>
            <div
              className="w-6 h-6 bg-pfm-orange-800 rounded-full absolute -top-1 drop-shadow"
              style={{
                left:
                  ((trackPosition ?? 0) / (trackDuration ?? 1)) * 100 -
                  1.5 +
                  '%',
              }}
            ></div>
          </div>

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

          <div className="flex flex-col space-y-2">
            {/* Add song to spotify queue */}
            <p className="text-xs">
              Search result: Bombtrack by Rage Against The Machine
            </p>
            <p className="text-xs">Search result URI: {searchResultURI}</p>
            <Button
              size={'small'}
              onClick={() => {
                addTrackToSpotifyQueue(
                  searchResultURI,
                  deviceId,
                  props.token,
                ).then(res => {
                  if (res.status !== 202)
                    alert('failed adding to spotify queue');
                });
              }}
            >
              Add track
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default WebPlayback;
