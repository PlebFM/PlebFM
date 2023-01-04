import { getSession, signOut } from 'next-auth/react';
import Script from 'next/script';
import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { addTrackToSpotifyQueue, transferDevice } from '../lib/spotify';

type Props = {
  token: string;
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
};

export const WebPlayback = ({ token, paused, setPaused }: Props) => {
  const [is_active, setActive] = useState<boolean>(false);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [current_track, setTrack] = useState<Spotify.Track | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => {
    if (!player || !player.is_active) return;
    if (paused) player.pause();
    else player.resume();
  }, [player, paused]);
  useEffect(() => {
    if (!player) return;
    console.log('playerrrr', player);
    player.getCurrentState().then(state => {
      if (!state) {
        console.error('User is not playing music through the Web Playback SDK');
        return;
      }
      const current_track = state.track_window.current_track;
      const next_track = state.track_window.next_tracks[0];

      console.log('Currently Playing', current_track);
      console.log('Playing Next', next_track);
      console.log('CURRENT STATE', state);
    });
  }, [player]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    //@ts-ignore
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('ready');
      const player = new window.Spotify.Player({
        name: 'Pleb.FM',
        getOAuthToken: cb => {
          // console.log(token);
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);
      player.on('playback_error', ({ message }) => {
        console.error('Failed to perform playback', message);
      });

      player.on('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account', message);
      });

      player.on('authentication_error', ({ message }) => {
        console.error('Failed to authenticate', message);
      });

      player.on('initialization_error', ({ message }) => {
        console.error('Failed to initialize', message);
      });

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        console.log('Ready with Device ID', device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', state => {
        console.log('state changed', state);
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        if (state.paused !== paused) setPaused(state.paused);

        player?.getCurrentState().then(state => {
          if (!state) {
            setActive(false);
          } else {
            setActive(true);
          }
        });
      });
      player.connect(); //.then(() => player.activateElement().then(() => console.log('activated')));
    };
  }, [token]);

  if (!player) {
    return (
      <>
        <Script src="https://sdk.scdn.co/spotify-player.js" />
        <div>
          <div>
            <b>Spotify Player is null</b>
          </div>
        </div>
      </>
    );
  } else if (!is_active) {
    return (
      <>
        <div>
          <button
            onClick={() => {
              player.activateElement();
              deviceId &&
                transferDevice(deviceId, token).then(x => console.log(x));
              console.log('clicked');
            }}
          >
            {'START'}
          </button>
          <br />
          <button
            onClick={() => {
              const addToQueue =
                deviceId &&
                addTrackToSpotifyQueue(
                  'spotify:track:0AzD1FEuvkXP1verWfaZdv',
                  deviceId,
                  token,
                ).then(res => console.log(res));
              console.log('clicked');
            }}
          >
            {'QUEUE CBAT'}
          </button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div>
          <div>{current_track?.name}</div>
          <div>{current_track?.artists[0].name}</div>

          {/* <button
                onClick={() => {
                  player.previousTrack();
                }}
              >
                &lt;&lt;
              </button> */}

          <button
            onClick={() => {
              if (paused)
                player.resume().then(() => {
                  console.log('Toggled Resume!');
                });
              else {
                player.pause().then(() => {
                  console.log('Toggled Paused!');
                });
              }
            }}
          >
            {paused ? 'RESUME' : 'PAUSE'}
          </button>

          {/* <button
                onClick={() => {
                  player.nextTrack();
                }}
              >
                &gt;&gt;
              </button> */}
        </div>
      </>
    );
  }
};
