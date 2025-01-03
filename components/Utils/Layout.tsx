import Head from 'next/head';
import React, { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export default function Layout(props: LayoutProps) {
  return (
    <>
      <Head>
        <title>{`${props.title} - PlebFM`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Bitcoin-Powered Jukebox - An Ongoing Auction for the Next Song"
        />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>
      <main className="m-auto fixed-w bg-gradient-to-b from-pfm-purple-400 to-pfm-purple-100">
        {props.children}
      </main>
    </>
  );
}
