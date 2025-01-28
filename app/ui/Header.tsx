'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import plebFMLogo from '../../public/plebfm-logo-bold.svg';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  hostName: string;
  shortName: string;
  loggedIn: boolean;
};

export function Header({ hostName, shortName, loggedIn }: HeaderProps) {
  const router = useRouter();
  return (
    <div className="bg-black/50 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 flex items-center h-16 justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src={plebFMLogo}
                alt="PlebFM"
                className="h-8 w-auto hover:opacity-80 transition-opacity"
                width={120}
              />
            </Link>
          </div>
          <div className="flex items-center overflow-x-scroll mx-4 px-4 hide-scrollbar">
            <div className="flex items-center space-x-2 min-w-max">
              <Link
                href="/host/plans"
                className="text-xs bg-white/5 hover:bg-white/10 text-white/70 px-2 py-1.5 rounded-full transition-colors whitespace-nowrap inline-flex items-center gap-1"
                target="_blank"
              >
                <span className="hidden sm:inline">View </span>Plans
              </Link>
              <div className="w-px h-4 bg-white/10" />
              {loggedIn && (
                <>
                  <Link
                    href="/host/queue"
                    className="text-xs bg-white/5 hover:bg-white/10 text-white/70 px-2 py-1.5 rounded-full transition-colors whitespace-nowrap inline-flex items-center gap-1"
                    target="_blank"
                  >
                    <span className="hidden sm:inline">View </span>Leaderboard
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </Link>
                  <div className="w-px h-4 bg-white/10" />
                  <Link
                    href={`/${shortName}`}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white/70 px-2 py-1.5 rounded-full transition-colors whitespace-nowrap inline-flex items-center gap-1"
                    target="_blank"
                  >
                    <span className="hidden sm:inline">View </span>Public Page
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              {loggedIn && (
                <>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="hidden md:block text-sm text-white/50 px-2">
                    {hostName}
                  </div>
                </>
              )}
              <button
                onClick={() =>
                  loggedIn
                    ? signOut({ callbackUrl: '/host/login' })
                    : router.push('/host/login')
                }
                className="text-sm text-white/50 hover:text-white/70 transition-colors whitespace-nowrap px-2"
              >
                {loggedIn ? 'Logout' : 'Host Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
