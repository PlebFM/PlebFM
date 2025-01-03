import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import plebFMLogoBold from '../../public/plebfm-logo-bold.svg';
import { ReactNode } from 'react';

interface HostLayoutProps {
  title: string;
  children: ReactNode;
}

export default function HostLoginLayout({ title, children }: HostLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>{`${title} - PlebFM`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>

      <header className="absolute top-0 left-0 right-0 p-4 pb-0">
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="block w-28 transition-opacity hover:opacity-80"
          >
            <Image
              src={plebFMLogoBold}
              alt="PlebFM"
              priority
              className="w-full"
            />
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto pt-16 px-4">{children}</main>
    </div>
  );
}
