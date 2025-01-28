'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import bokeh2 from '../../public/pfm-bokeh-2.jpg';
import Hero from './Hero';
import UserSection from './UserSection';
import HostSection from './HostSection';
import { Host } from '../hooks/useHost';
import { Footer } from '../../app/ui/Footer';

interface IndexProps {
  hosts: Host[];
  error?: string;
}

export function LandingPage({ hosts, error }: IndexProps) {
  return (
    <div>
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
