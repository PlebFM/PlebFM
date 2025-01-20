import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { transferPlayback } from '../../lib/spotify';
import { usePlayback } from '../Providers/PlaybackProvider';
import Button from '../Utils/Button';

type Props = {
  isActive: boolean;
  player?: Spotify.Player;
  browserDeviceId: string;
  token: string;
  isPaused: boolean;
  trackPosition?: number;
  trackDuration?: number;
};

export const PlaybackControls = () => {
  const {
    isPaused,
    trackDuration,
    trackPosition,
    isActive,
    player,
    browserDeviceId,
    track,
    token,
  } = usePlayback();

  return (
    <>
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
    </>
  );
};
