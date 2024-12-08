import { transferPlayback } from '../../lib/spotify';
import Button from '../Utils/Button';

type Props = {
  player?: Spotify.Player;
  browserDeviceId: string;
  token: string;
};

export const PlaybackInactive = ({ player, browserDeviceId, token }: Props) => {
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
};
