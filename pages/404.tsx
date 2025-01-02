import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import logo from '../public/plebfm-logo.svg';
import Head from 'next/head';

export default function NotFound() {
  const router = useRouter();

  const [redirectPath, setRedirectPath] = useState('/');

  useEffect(() => {
    if (router.asPath.startsWith('/host/')) {
      setRedirectPath('/host/login');
    }
  }, [router]);

  return (
    <div>
      <Head>
        <title>404 - Page Not Found | PlebFM</title>
      </Head>

      <div className="fixed w-full h-full bg-black top-0 left-0">
        <Image
          src={bokeh2}
          alt="background"
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-10"
        />
      </div>

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
