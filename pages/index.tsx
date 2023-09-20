import Head from 'next/head';
import plebFMLogo from '../public/plebfm-logo.svg';
import Image from 'next/image';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import Link from 'next/link';
import { useState } from 'react';
import Button from '../components/Utils/Button';
import {
  CaretDownIcon,
  CaretUpIcon,
} from '@bitcoin-design/bitcoin-icons-react/outline';

interface InputProps {
  value?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  value = '',
  type = 'text',
  placeholder = '...',
  required = false,
  name,
  id,
  onChange,
}: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full p-4 text-lg bg-white/10 placeholder:text-pfm-neutral-800 text-pfm-orange-800 outline outline-2 outline-white focus:outline-pfm-orange-800"
      value={value}
      required={required}
      id={id}
      name={name}
      onChange={onChange}
    />
  );
};

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nostr: '',
  });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold">Sign Up</h3>

      <p>
        Interested in starting your own Jukebox? Awesome, we&rsquo;ll be in
        touch to help you out.
      </p>

      <form
        name="plebfm-jukebox-signup"
        data-netlify="true"
        className="flex flex-col gap-y-8 py-8"
      >
        <div>
          <label htmlFor="name">Name / Nym</label>
          <Input
            name="name"
            id="name"
            placeholder="SatBoy Slim"
            value={formData.name}
            required
            onChange={e => {
              setFormData({ ...formData, name: e.target.value });
            }}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="satstacker69@atlbitlab.com"
            value={formData.email}
            onChange={e => {
              setFormData({ ...formData, email: e.target.value });
            }}
          />
        </div>
        <div>
          <label htmlFor="nostr">Nostr Npub / NIP-05</label>
          <Input
            name="nostr"
            id="nostr"
            placeholder="npub123abc..."
            value={formData.nostr}
            onChange={e => {
              setFormData({ ...formData, nostr: e.target.value });
            }}
          />
        </div>

        <Button>Submit</Button>
      </form>
    </div>
  );
};

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
            </li>
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
