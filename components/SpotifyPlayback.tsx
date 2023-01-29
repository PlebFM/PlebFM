import React, { useState, useEffect } from 'react';
import Button from './Button';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import { addTrackToSpotifyQueue, transferDevice } from '../lib/spotify';

const track = {
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
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [device_id, setDeviceId] = useState('');
  const [current_track, setTrack] = useState(track);
  const [songProgress, setSongProgress] = useState(0.1);

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

      player.addListener('player_state_changed', state => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then(state => {
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect();
    };
  }, []);

  const searchResultURI = 'spotify:track:2rBHnIxbhkMGLpqmsNX91M';
  const urlEncodedSearchResultURI = 'spotify%3Atrack%3A2rBHnIxbhkMGLpqmsNX91M';

  if (!is_active) {
    return (
      <div className="text-3xl p-16 flex flex-col space-y-6 mb-8">
        Instance not active. Transfer your playback using your Spotify app, or
        click the button below.
        <div className="flex flex-col space-y-2 mt-3">
          {/* Transfer device playback to PlebFM  */}
          <Button
            size={'small'}
            onClick={() => {
              transferDevice(device_id, props.token);
              console.log('transferDevice called');
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
            src={current_track.album.images[0].url}
            className="w-64 h-64"
            alt={current_track.name + ' album art'}
          />

          <p>{current_track.name}</p>

          <p className="font-bold">{current_track.artists[0].name}</p>

          <div className="w-full bg-white/20 h-4 rounded-full drop-shadow relative ">
            <div
              className="bg-pfm-orange-500 h-full rounded-full"
              style={{
                width: songProgress * 100 + '%',
                transition: '2s ease',
              }}
            ></div>
            <div
              className="w-6 h-6 bg-pfm-orange-800 rounded-full absolute -top-1 drop-shadow"
              style={{
                left: songProgress * 100 - 1.5 + '%',
                transition: '2s ease',
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
              icon={is_paused ? <PlayIcon /> : <PauseIcon />}
              onClick={() => {
                if (player) player.togglePlay();
              }}
              iconOnly={true}
            >
              {is_paused ? 'Play' : 'Pause'}
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
                  device_id,
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
