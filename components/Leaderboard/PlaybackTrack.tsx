type Props = {
  track?: Spotify.Track;
  trackPosition?: number;
  trackDuration?: number;
};

export const PlaybackTrack = ({
  track,
  trackPosition,
  trackDuration,
}: Props) => {
  return (
    <>
      {/* Wrapper */}
      <div>
        <p className="mb-0">{track?.name}</p>
        <p className="font-bold mb-">{track?.artists?.[0]?.name}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 h-2 rounded-full drop-shadow relative">
        <div
          className="bg-pfm-orange-500 h-full rounded-full rounded-r-none"
          style={{
            width: ((trackPosition ?? 0) / (trackDuration ?? 1)) * 100 + '%',
          }}
        ></div>
        <div
          className="w-4 h-4 bg-pfm-orange-800 rounded-full absolute -top-1 drop-shadow"
          style={{
            left:
              ((trackPosition ?? 0) / (trackDuration ?? 1)) * 100 - 1.5 + '%',
          }}
        ></div>
      </div>
    </>
  );
};
