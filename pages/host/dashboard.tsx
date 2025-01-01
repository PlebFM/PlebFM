import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  MusicalNoteIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

import { Header } from '../../components/Dashboard/Header';
import { MobileMenu } from '../../components/Dashboard/MobileMenu';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { QuickActions } from '../../components/Dashboard/QuickActions';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';

export default function HostDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [host, setHost] = useState<any>(null);
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
        setHost(data.hosts[0]);
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

  if (!host) return null;

  const mockActivities = [
    {
      id: '1',
      type: 'song_added' as const,
      title: 'Someone added "Thunderstruck" to the queue',
      timestamp: '2 minutes ago',
    },
    {
      id: '2',
      type: 'song_played' as const,
      title: '"Sweet Home Alabama" started playing',
      timestamp: '5 minutes ago',
    },
    {
      id: '3',
      type: 'song_skipped' as const,
      title: 'You skipped "Free Bird"',
      timestamp: '10 minutes ago',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>{host.hostName} - PlebFM Dashboard</title>
      </Head>

      <Header
        hostName={host.hostName}
        shortName={host.shortName}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <MobileMenu isOpen={mobileMenuOpen} shortName={host.shortName} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {host.hostName}
          </h1>
          <p className="text-white/60 mt-2 mb-8">
            Here&apos;s what&apos;s happening with your jukebox today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Songs in Queue"
              value="12"
              trend="+20%"
              icon={<MusicalNoteIcon className="h-6 w-6 text-purple-400" />}
              iconBg="bg-purple-400/10"
            />
            <StatsCard
              title="Total Earned"
              value="$420.69"
              trend="+15%"
              icon={<CurrencyDollarIcon className="h-6 w-6 text-green-400" />}
              iconBg="bg-green-400/10"
            />
            <StatsCard
              title="Active Users"
              value="69"
              trend="+25%"
              icon={<UsersIcon className="h-6 w-6 text-blue-400" />}
              iconBg="bg-blue-400/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions
              onSkip={() => console.log('Skip song')}
              onManageQueue={() => router.push('/host/queue')}
            />
            <RecentActivity activities={mockActivities} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
