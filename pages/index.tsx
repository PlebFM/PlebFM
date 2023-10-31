import Head from 'next/head';
import plebFMLogo from '../public/plebfm-logo.svg';
import Image from 'next/image';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import Link from 'next/link';
import { useState } from 'react';
import {
  CaretDownIcon,
  CaretUpIcon,
} from '@bitcoin-design/bitcoin-icons-react/outline';
import { SignupForm } from '../components/Landing/SignupForm';

// pleb.fm
// "Find your jukebox" screen?
export default function Index() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <Head>
        <title>PlebFM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pleb-fm-favicon.svg" />
      </Head>

      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
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

          <p className="text-xl">
            PlebFM is an auction-style, lightning powered jukebox. Choose a
            song, then outbid other plebs to push your song to the top of the
            queue.
          </p>

          <h2 className="text-3xl font-light">Join an Active Jukebox</h2>

          <ul className="text-2xl list-disc">
            <li className="p-4">
              <Link href="/atl" className="underline text-pfm-orange-800">
                Atlanta BitDevs
              </Link>
            </li>
            <li className="p-4">
              <Link href="/atlbitlab" className="underline text-pfm-orange-800">
                ATL BitLab
              </Link>
            </li>
            <li className="p-4">
              <Link href="/pleblab" className="underline text-pfm-orange-800">
                PlebLab - Austin, TX
              </Link>
            </li>
            <li className="p-4">
              <Link href="/btcgrove" className="underline text-pfm-orange-800">
                Bitcoin Grove - Miami, FL
              </Link>
            </li>
            <li className="p-4">
              <Link href="/satsconf" className="underline text-pfm-orange-800">
                Sats Conf - Sao Paulo, Brazil
              </Link>
            </li>
            <br />
            <span
              className="underline cursor-pointer flex flex-row gap-2 items-center"
              onClick={() => setShowForm(!showForm)}
            >
              Start Your Own
              <span>
                {showForm ? (
                  <CaretUpIcon className="w-6 h-6" />
                ) : (
                  <CaretDownIcon className="w-6 h-6" />
                )}
              </span>
            </span>
          </ul>
          {showForm ? (
            <div>
              <SignupForm />
            </div>
          ) : (
            ``
          )}
        </div>
      </div>
    </div>
  );
}
