import React, { useState, useEffect } from 'react';
import Button from '../Utils/Button';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import { transferPlayback } from '../../lib/spotify';
import { useSpotifyPlayback } from '../hooks/useSpotifyPlayback';
import { PlaybackControls } from './PlaybackControls';
import { PlaybackInactive } from './PlaybackInactive';
import { PlaybackTrack } from './PlaybackTrack';
import { PlaybackAlbum } from './PlaybackAlbum';

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

  if (!isActive && !track?.name) {
    return (
      <PlaybackInactive
        player={player}
        browserDeviceId={browserDeviceId}
        token={token}
      />
    );
  } else {
    return (
      <>
        <div className="text-3xl h-full flex flex-col space-y-6 justify-end">
          {/* Album Art */}
          <PlaybackAlbum track={track} />

          {/* Wrapper */}
          <div className="flex flex-col space-y-6 p-6 relative z-50 bg-gradient-to-b from-black/0 to-black/50">
            <PlaybackTrack
              track={track}
              trackPosition={trackPosition}
              trackDuration={trackDuration}
            />

            {/* Playback Controls */}
            <PlaybackControls
              isActive={isActive}
              player={player}
              browserDeviceId={browserDeviceId}
              token={token}
              isPaused={isPaused}
              trackPosition={trackPosition}
              trackDuration={trackDuration}
            />
          </div>
        </div>
      </>
    );
  }
}

export default WebPlayback;
