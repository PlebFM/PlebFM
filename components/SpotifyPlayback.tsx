import React, { useState, useEffect } from 'react';
import { addTrackToSpotifyQueue } from '../lib/spotify';

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
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>
              {' '}
              Instance not active. Transfer your playback using your Spotify app{' '}
            </b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <img
              src={current_track.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />

            <div className="now-playing__side">
              <div className="now-playing__name">{current_track.name}</div>
              <div className="now-playing__artist">
                {current_track.artists[0].name}
              </div>

              <button
                className="btn-spotify"
                onClick={() => {
                  if (player) player.previousTrack();
                }}
              >
                &lt;&lt;
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  if (player) player.togglePlay();
                }}
              >
                {is_paused ? 'PLAY' : 'PAUSE'}
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  if (player) player.nextTrack();
                }}
              >
                &gt;&gt;
              </button>
            </div>
            <br />

            {/* Add song to spotify queue */}
            <p>Search result: Bombtrack by Rage Against The Machine</p>
            <p>Search result URI: {searchResultURI}</p>
            <button
              onClick={() => {
                addTrackToSpotifyQueue(
                  urlEncodedSearchResultURI,
                  props.token,
                  device_id,
                );
              }}
              style={{ borderWidth: '5px' }}
            >
              Add track to spotify queue
            </button>
          </div>
        </div>
        <br />
        <br />
      </>
    );
  }
}

export default WebPlayback;
