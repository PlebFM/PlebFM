import { transferPlayback } from '../../lib/spotify';
import { useActivateDevice, usePlayback } from '../Providers/PlaybackProvider';
import Button from '../Utils/Button';

export const PlaybackInactive = () => {
  const { player, browserDeviceId, token } = usePlayback();
  const activateDevice = useActivateDevice();

  return (
    <div className="text-3xl p-8 flex flex-col space-y-6 mb-8 h-screen">
      Instance not active. Transfer your playback using your Spotify app, or
      click the button below.
      <div className="flex flex-col space-y-2 mt-6">
        {/* Transfer playback to PlebFM  */}
        <Button size={'small'} onClick={activateDevice}>
          Transfer playback to PlebFM
        </Button>
      </div>
    </div>
  );
};
