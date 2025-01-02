import Image from 'next/image';
import plebFMLogo from '../../public/plebfm-logo.svg';

export default function Hero() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Pleb.FM</h1>

      <Image src={plebFMLogo} alt="PlebFM logo" className="mx-auto w-full" />

      <p className="text-xl text-center text-white/90">
        PlebFM is an auction-style, lightning powered jukebox. Choose songs and
        outbid others to control the playlist.
      </p>
    </div>
  );
}
