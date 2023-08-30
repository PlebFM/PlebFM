import Head from 'next/head';
import React, { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export default function Layout(props: LayoutProps) {
  const title = (props.title ? props.title + ' | ' : '') + 'PlebFM';
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>
      <main className="m-auto fixed-w bg-gradient-to-b from-pfm-purple-400 to-pfm-purple-100">
        {props.children}
      </main>
    </>
  );
}
