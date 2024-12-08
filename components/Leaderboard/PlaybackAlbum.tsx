type Props = {
  track?: Spotify.Track;
};

export const PlaybackAlbum = ({ track }: Props) => {
  return (
    <div className="text-left p-6 pb-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={track?.album?.images?.[0]?.url}
        className="absolute top-0 left-0 w-full h-full object-cover blur-xl scale-125"
        alt={track?.name + ' album art'}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={track?.album?.images?.[0]?.url}
        className="w-[230px] h-auto relative z-50 drop-shadow-2xl"
        alt={track?.name + ' album art'}
      />
    </div>
  );
};
