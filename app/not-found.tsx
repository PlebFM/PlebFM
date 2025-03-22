'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '../public/plebfm-logo.svg';
import BackgroundGradient from './ui/BackgroundGradient';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [redirectPath, setRedirectPath] = useState('/');

  useEffect(() => {
    if (pathname?.startsWith('/host/')) {
      setRedirectPath('/host/login');
    }
  }, [pathname]);

  return (
    <div>
      <BackgroundGradient />

      <div className="relative z-50 h-screen flex flex-col items-center justify-center p-8 text-white">
        <Image
          src={logo}
          alt="PlebFM Logo"
          width={200}
          height={60}
          className="mb-12"
          priority
        />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">This page doesn&apos;t exist</p>
        <button
          onClick={() => router.push(redirectPath)}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
