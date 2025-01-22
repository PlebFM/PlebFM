import Head from 'next/head';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import { motion } from 'framer-motion';
import bokeh2 from '../public/pfm-bokeh-2.jpg';
import Hero from '../components/Landing/Hero';
import UserSection from '../components/Landing/UserSection';
import HostSection from '../components/Landing/HostSection';
import { Host } from '../components/hooks/useHost';

interface IndexProps {
  hosts: Host[];
  error?: string;
}

export default function Index({ hosts, error }: IndexProps) {
  return (
    <div>
      <Head>
        <title>PlebFM</title>
      </Head>

      <div className="fixed w-full h-full bg-black top-0 left-0">
        <Image
          src={bokeh2}
          alt="xl"
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-15"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 max-w-2xl mx-auto p-8 text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Hero />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
        >
          <UserSection hosts={hosts} error={error} />
          <HostSection />
        </motion.div>
      </motion.div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts`,
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch hosts');
    }

    return {
      props: {
        hosts: data.hosts,
      },
    };
  } catch (err) {
    return {
      props: {
        hosts: [],
        error: err instanceof Error ? err.message : 'Failed to fetch hosts',
      },
    };
  }
};
