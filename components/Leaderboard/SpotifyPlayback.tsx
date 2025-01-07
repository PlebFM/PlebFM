import React from 'react';
import { useSpotifyPlayback } from '../hooks/useSpotifyPlayback';
import { PlaybackControls } from './PlaybackControls';
import { PlaybackInactive } from './PlaybackInactive';
import { PlaybackTrack } from './PlaybackTrack';
import { PlaybackAlbum } from './PlaybackAlbum';
import { PlaybackEmpty } from './PlaybackEmpty';

interface WebPlaybackProps {
  token: string;
  shortName: string;
  refreshQueue: () => void;
}

function WebPlayback({ token, shortName, refreshQueue }: WebPlaybackProps) {
  const {
    isPaused,
    trackDuration,
    trackPosition,
    isActive,
    player,
    deviceId,
    browserDeviceId,
    track,
  } = useSpotifyPlayback({ token, shortName, refreshQueue });

  const controls = (
    <PlaybackControls
      isActive={isActive}
      player={player}
      browserDeviceId={browserDeviceId}
      token={token}
      isPaused={isPaused}
      trackPosition={trackPosition}
      trackDuration={trackDuration}
    />
  );

  if (!isActive) {
    return (
      <PlaybackInactive
        player={player}
        browserDeviceId={browserDeviceId}
        token={token}
      />
    );
  }

  return (
    <div className="text-3xl h-full flex flex-col space-y-6 justify-end">
      {/* Album Art or Empty State */}
      <div className="flex flex-col space-y-6 p-6 relative z-50 bg-gradient-to-b from-black/0 to-black/50">
        <div className="text-left flex flex-col items-center justify-center h-[400px] bg-black/30 backdrop-blur-lg rounded-lg">
          {track?.name ? <PlaybackAlbum track={track} /> : <PlaybackEmpty />}
        </div>

        {/* Controls Wrapper */}
        {track?.name && (
          <PlaybackTrack
            track={track}
            trackPosition={trackPosition}
            trackDuration={trackDuration}
          />
        )}
        {controls}
      </div>
    </div>
  );
}

export default WebPlayback;
