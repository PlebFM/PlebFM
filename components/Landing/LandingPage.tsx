'use client';

import Image from 'next/image';
import { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import UserSection from './UserSection';
import HostSection from './HostSection';
import { Host } from '../hooks/useHost';
import { Footer } from '../../app/ui/Footer';

interface IndexProps {
  hosts: Host[];
  error?: string;
}

// Preload critical routes
const preloadRoutes = () => {
  if (typeof window !== 'undefined') {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'fetch';
    preloadLink.href = '/host/login';
    document.head.appendChild(preloadLink);

    const preloadSignup = document.createElement('link');
    preloadSignup.rel = 'preload';
    preloadSignup.as = 'fetch';
    preloadSignup.href = '/host/signup';
    document.head.appendChild(preloadSignup);
  }
};

export const LandingPage = memo(function LandingPage({
  hosts,
  error,
}: IndexProps) {
  // Preload critical routes after initial render
  useEffect(() => {
    preloadRoutes();
  }, []);

  return (
    <div>
      <div className="fixed w-full h-full bg-black top-0 left-0">
        <Image
          src={'/pfm-bokeh-2.jpg'}
          alt="background"
          fill
          sizes="100vw"
          priority
          className="object-cover w-full h-full blur-2xl opacity-15"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-50 max-w-2xl mx-auto p-8 text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Hero />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
        >
          <UserSection hosts={hosts} error={error} />
          <HostSection />
        </motion.div>
      </motion.div>
    </div>
  );
});
