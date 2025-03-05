'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import logo from '../public/plebfm-logo.svg';
import { useRouter } from 'next/navigation';
import BackgroundGradient from './ui/BackgroundGradient';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const router = useRouter();

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
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-xl mb-8">We apologize for the inconvenience</p>
        <div className="flex space-x-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
