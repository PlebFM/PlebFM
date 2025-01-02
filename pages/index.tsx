import Head from 'next/head';
import Image from 'next/image';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import Hero from '../components/Landing/Hero';
import UserSection from '../components/Landing/UserSection';
import HostSection from '../components/Landing/HostSection';

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
        <Hero />
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <UserSection />
          <HostSection />
        </div>
      </div>
    </div>
  );
}
