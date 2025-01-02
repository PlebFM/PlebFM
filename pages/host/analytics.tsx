import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';

import { Header } from '../../components/Dashboard/Header';
import { MobileMenu } from '../../components/Dashboard/MobileMenu';

export default function HostAnalytics() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shortName, setShortName] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHost = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/hosts?spotifyId=${session.user.id}`);
        const data = await res.json();
        if (data.hosts.length === 0) {
          router.push('/host/signup');
          return;
        }
        setShortName(data.hosts[0].shortName);
        setHostName(data.hosts[0].hostName);
      } catch (error) {
        console.error('Error fetching host:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHost();
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/50"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!shortName) return null;

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>{shortName} - Analytics</title>
      </Head>

      <Header
        hostName={hostName ?? ''}
        shortName={shortName}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        shortName={shortName}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Analytics</h1>
            <p className="text-white/60 text-lg">Coming Soon</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
