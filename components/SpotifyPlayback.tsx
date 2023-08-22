import React, { useState, useEffect } from 'react';
import Button from './Button';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { addTrackToSpotifyQueue, transferPlayback } from '../lib/spotify';

const emptyTrack = {
  name: '',
  album: {
    images: [{ url: '' }],
  },
  artists: [{ name: '' }],
};

interface WebPlaybackProps {
  token: string;
}

function WebPlayback(props: WebPlaybackProps) {
  const [isPaused, setPaused] = useState(false);
  const [isActive, setActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [deciceId, setDeviceId] = useState('');
  const [track, setTrack] = useState(emptyTrack);
  const [songProgress, setSongProgress] = useState(0);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'PlebFM',
        getOAuthToken: cb => {
          cb(props.token);
        },
        volume: 0.5,
      });

      console.log(player);

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      let myTimer: any = null;
      let progress: number = songProgress;

      player.addListener('player_state_changed', state => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        if (state.paused) {
          clearInterval(myTimer);
          myTimer = null;

          progress = state.position / state.duration;
          setSongProgress(progress);
        } else {
          progress = state.position / state.duration;
          setSongProgress(progress);
          if (!myTimer) {
            myTimer = setInterval(() => {
              progress += 1000 / state.duration;
              setSongProgress(progress + 1000 / state.duration);
            }, 1000);
          }
        }

        player.getCurrentState().then(state => {
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect();
    };
  }, []);

  useEffect(() => {}, []);

  useEffect(() => {
    if (deciceId) {
      transferPlayback(deciceId, props.token);
    }
  }, [deciceId]);

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
              transferPlayback(deciceId, props.token);
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
                width: songProgress * 100 + '%',
              }}
            ></div>
            <div
              className="w-6 h-6 bg-pfm-orange-800 rounded-full absolute -top-1 drop-shadow"
              style={{
                left: songProgress * 100 - 1.5 + '%',
              }}
            ></div>
          </div>

          <div className="flex flex-row space-x-2">
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
                if (player) player.nextTrack();
              }}
            >
              Next Song
            </Button>
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
                  deciceId,
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
