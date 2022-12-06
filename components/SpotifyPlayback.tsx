"use client"
import { getSession, signOut } from 'next-auth/react';
import Script from 'next/script'
import { useState, useEffect } from "react";
import { addTrackToQueue, transferDevice } from '../lib/spotify';

type Props = {
  token: string;
};

export const WebPlayback = ({ token }: Props) => {
  const [is_paused, setPaused] = useState<boolean>(false);
  const [is_active, setActive] = useState<boolean>(false);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [current_track, setTrack] = useState<Spotify.Track | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // if (token?.error === 'invalid_client' ?? false) {
    //   console.log('signingout')
    //   // signOut();
    // }
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    //@ts-ignore
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('ready');
      const player = new window.Spotify.Player({
        name: "Pleb.FM",
        getOAuthToken: (cb) => {
          // console.log(token);
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player?.getCurrentState().then((state) => {
          if (!state) {
            setActive(false);
          } else {
            setActive(true);
          }
        });
      });
      player.connect()//.then(() => player.activateElement().then(() => console.log('activated')));
    };
  }, [token]);

  if (!player) {
    return (
      <>
      <Script src="https://sdk.scdn.co/spotify-player.js"/>
        <div className="container">
          <div className="main-wrapper">
            <b>Spotify Player is null</b>
          </div>
        </div>
      </>
    );
  } else if (!is_active) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>
              Instance not active. Transfer your playback using your Spotify app
            </b>
            <br />
            <button
              className="btn-spotify"
              onClick={() => {
                player.activateElement();
                deviceId && transferDevice(deviceId, token).then(x => console.log(x));
                console.log('clicked');
              }}
            >
              {"TRANSFER TO ME"}
            </button>
            <br />
            <button
              className="btn-spotify"
              onClick={() => {
                const addToQueue = deviceId && addTrackToQueue('spotify:track:0AzD1FEuvkXP1verWfaZdv', deviceId, token).then((res) => console.log(res));
                console.log('clicked');
              }}
            >
              {"QUEUE CBAT"}
            </button>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <div className=""></div>

            <div className="now-playing__side">
              <div className="now-playing__name">{current_track?.name}</div>
              <div className="now-playing__artist">
                {current_track?.artists[0].name}
              </div>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.previousTrack();
                }}
              >
                &lt;&lt;
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.togglePlay();
                }}
              >
                {is_paused ? "PLAY" : "PAUSE"}
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.nextTrack();
                }}
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
};