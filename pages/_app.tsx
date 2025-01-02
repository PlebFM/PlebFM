import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';

// Add global styles to prevent overscroll
const globalStyles = `
  html, body {
    background: black;
    overscroll-behavior: none;
    height: 100%;
    overflow-x: hidden;
  }

  #__next {
    min-height: 100%;
    background: black;
  }
`;

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/pleb-fm-favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>
        {globalStyles}
      </style>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
