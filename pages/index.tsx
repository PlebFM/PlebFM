import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled';
import Head from 'next/head';

// pleb.fm
// "Find your jukebox" screen?
export default function Index() {
  return (
    <div>
      <Head>
        <title>PlebFM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>
      <h1 className="text-4xl font-bold">Hello World! Pleb.FM</h1>
      <BitcoinIcon className="w-4 h-4" />
    </div>
  );
}
