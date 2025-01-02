import Image from 'next/image';
import Link from 'next/link';
import plebFMLogo from '../../public/plebfm-logo.svg';

export default function HostHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 p-4">
      <div className="max-w-xl mx-auto">
        <Link
          href="/"
          className="block w-32 transition-opacity hover:opacity-80"
        >
          <Image src={plebFMLogo} alt="PlebFM" priority className="w-full" />
        </Link>
      </div>
    </header>
  );
}
