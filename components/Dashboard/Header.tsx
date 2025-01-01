import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3Icon } from '@heroicons/react/24/outline';
import plebFMLogo from '../../public/plebfm-logo.svg';

interface HeaderProps {
  hostName: string;
  shortName: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({
  hostName,
  shortName,
  mobileMenuOpen,
  setMobileMenuOpen,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image
              src={plebFMLogo}
              alt="PlebFM"
              className="h-8 w-auto"
              width={120}
            />
            <div className="hidden lg:flex ml-8 space-x-6">
              <Link
                href="/host/dashboard"
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/host/queue"
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Queue
              </Link>
              <Link
                href="/host/analytics"
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/host/settings"
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href={`/${shortName}`}
              className="text-xs bg-white/5 hover:bg-white/10 text-white/70 px-3 py-1.5 rounded-full transition-colors"
              target="_blank"
            >
              View Public Page
            </Link>
            <div className="text-sm text-white/50">{hostName}</div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              Logout
            </button>
          </div>
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Bars3Icon className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
