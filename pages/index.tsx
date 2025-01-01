import Head from 'next/head';
import plebFMLogo from '../public/plebfm-logo.svg';
import Image from 'next/image';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import Link from 'next/link';

export default function Index() {
  return (
    <div>
      <Head>
        <title>PlebFM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>

      <div className="fixed w-full h-full bg-black top-0 left-0">
        <Image
          src={bokeh2}
          alt="xl"
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-10"
        />
      </div>

      <div className="relative z-50 max-w-2xl mx-auto p-8 text-white">
        <div className="flex flex-col gap-6">
          <h1 className="sr-only">Pleb.FM</h1>

          <Image
            src={plebFMLogo}
            alt="PlebFM logo"
            className="mx-auto w-full"
          />

          <p className="text-xl text-center text-white/90">
            PlebFM is an auction-style, lightning powered jukebox. Choose songs
            and outbid others to control the playlist.
          </p>

          <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* User Section */}
            <div className="flex-1 bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h2 className="text-2xl font-medium mb-4">
                Ready to Play Music?
              </h2>
              <p className="mb-6 text-white/80">
                Join an active jukebox and start bidding on your favorite songs.
              </p>

              <h3 className="text-xl mb-4">Active Jukeboxes</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/atl"
                    className="text-orange-300 hover:text-orange-200"
                  >
                    Atlanta BitDevs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/atlbitlab"
                    className="text-orange-300 hover:text-orange-200"
                  >
                    ATL BitLab
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pleblab"
                    className="text-orange-300 hover:text-orange-200"
                  >
                    PlebLab - Austin, TX
                  </Link>
                </li>
                <li>
                  <Link
                    href="/btcgrove"
                    className="text-orange-300 hover:text-orange-200"
                  >
                    Bitcoin Grove - Miami
                  </Link>
                </li>
              </ul>
            </div>

            {/* Host Section */}
            <div className="flex-1 bg-orange-100/10 backdrop-blur-sm p-6 rounded-lg">
              <h2 className="text-2xl font-medium mb-4">Want to Host?</h2>
              <p className="mb-6 text-white/80">
                Create your own jukebox for your venue, event, or space.
              </p>

              <div className="space-y-4">
                <Link
                  href="/host/signup"
                  className="block w-full text-center bg-orange-300/90 hover:bg-orange-300 text-black py-3 px-4 rounded-lg transition-colors"
                >
                  Create a Jukebox
                </Link>
                <Link
                  href="/host/learn-more"
                  className="block w-full text-center border border-orange-300/50 hover:border-orange-300 py-3 px-4 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
                <div className="pt-2">
                  <Link
                    href="/host/login"
                    className="block w-full text-center text-orange-300/90 hover:text-orange-300 text-sm transition-colors"
                  >
                    Already a host? Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
