import React from 'react';
import { PlaybackControls } from './PlaybackControls';
import { PlaybackInactive } from './PlaybackInactive';
import { PlaybackTrack } from './PlaybackTrack';
import { PlaybackAlbum } from './PlaybackAlbum';
import { PlaybackEmpty } from './PlaybackEmpty';
import Image from 'next/image';
import { usePlayback } from '../Providers/PlaybackProvider';

export const WebPlayback = () => {
  const { trackDuration, trackPosition, isActive, track } = usePlayback();

  const controls = <PlaybackControls />;

  if (!isActive) {
    return <PlaybackInactive />;
  }

  return (
    <>
      {/* Backdrop */}
      {track?.album?.images?.[0]?.url && (
        <Image
          src={track.album.images[0].url}
          height={500}
          width={500}
          className="fixed top-0 left-0 w-full h-full object-cover blur-xl scale-125 opacity-75 -z-10"
          alt={track?.name + ' album art backdrop'}
          priority
        />
      )}

      <div className="text-3xl h-full flex flex-col space-y-6 justify-end">
        {/* Album Art or Empty State */}
        <div className="text-left flex flex-col items-left justify-center h-[300px] p-6">
          {track?.name ? <PlaybackAlbum track={track} /> : <PlaybackEmpty />}
        </div>

        {/* Controls Wrapper */}
        <div className="flex flex-col space-y-6 p-6 relative z-50 bg-gradient-to-b from-black/0 to-black/50">
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
    </>
  );
};
