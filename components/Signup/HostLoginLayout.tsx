'use client';

import Head from 'next/head';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

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

      <SessionProvider>
        <main className="max-w-xl mx-auto pt-16 px-4">{children}</main>
      </SessionProvider>
    </div>
  );
}
