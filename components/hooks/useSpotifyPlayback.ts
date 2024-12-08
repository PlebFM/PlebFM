import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getPlaybackState } from '../../lib/spotify';
import { syncJukebox } from '../../utils/host';

type WebPlaybackProps = {
  token: string;
  shortName: string;
  refreshQueue: () => void;
};
export const useSpotifyPlayback = ({
  token,
  shortName,
  refreshQueue,
}: WebPlaybackProps) => {
  const [isPaused, setPaused] = useState(false);
  const [trackDuration, setDuration] = useState<number>();
  const [trackPosition, setPosition] = useState<number>();
  const [isActive, setActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [deviceId, setDeviceId] = useState('');
  const [browserDeviceId, setBrowserDeviceId] = useState('');
  const [track, setTrack] = useState<Spotify.Track>();

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
      getPlaybackState(token).then(x => {
        console.log('spotify playback state', x);
        if (x?.item) setTrack(x.item);
        if (x?.progress_ms) setPosition(x.progress_ms);
        if (x?.item?.duration_ms) setDuration(x.item.duration_ms);
        if (x?.device?.id) setDeviceId(x.device.id);
        if (x?.device?.is_active) setActive(x.device.is_active);
        if (x) setPaused(!x.is_playing);
      });
      syncJukebox(token, shortName, deviceId).then(res => {
        if (!res?.data) {
          console.error('failed to sync jukebox', res);
        }
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
        setBrowserDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setBrowserDeviceId('');
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
        if (!current_track) {
          console.log('no current track');
          setActive(false);
        } else {
          console.log('Currently Playing', current_track.name);
          // console.log('Position in Song', position);
          // console.log('Duration of Song', duration);
          setPosition(position);
          setDuration(duration);
          setPaused(paused);
          setTrack(current_track);
          player.getCurrentState().then(state => {
            console.log('state', state);
            if (state) {
              setActive(true);
              setPosition(state.position);
            }
          });
        }
      });

      player.connect();
    };
  }, [isActive, token]);

  return {
    isPaused,
    trackDuration,
    trackPosition,
    isActive,
    player,
    deviceId,
    browserDeviceId,
    track,
  };
};
