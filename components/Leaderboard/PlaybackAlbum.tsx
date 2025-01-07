import Image from 'next/image';

type Props = {
  track?: Spotify.Track;
};

export const PlaybackAlbum = ({ track }: Props) => {
  const imageUrl = track?.album?.images?.[0]?.url;
  if (!imageUrl) return null;

  return (
    <>
      <Image
        src={imageUrl}
        width={330}
        height={330}
        className="relative z-50 drop-shadow-2xl"
        alt={track?.name + ' album art'}
      />
    </>
  );
};
