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
import { useQueue } from '../../components/hooks/useQueue';
import type { Activity } from '../../components/Dashboard/RecentActivity';
import type { SongObject } from '../../utils/songs';

export default function HostDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shortName, setShortName] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [earnings, setEarnings] = useState(0);

  // Get queue data
  const { queueData, refreshQueue } = useQueue(false, shortName ?? undefined);

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

  // Fetch earnings data
  // useEffect(() => {
  //   const fetchEarnings = async () => {
  //     if (!host) return;
  //     try {
  //       // const res = await fetch(`/api/earnings?shortName=${host.shortName}`);
  //       // const data = await res.json();
  //       // setEarnings(data.total || 0);
  //     } catch (error) {
  //       console.error('Error fetching earnings:', error);
  //     }
  //   };

  //   fetchEarnings();
  //   // Refresh earnings every minute
  //   const interval = setInterval(fetchEarnings, 60000);
  //   return () => clearInterval(interval);
  // }, [host]);

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

  const recentActivities: Activity[] = [
    // track && {
    //   id: 'current',
    //   type: 'song_played',
    //   title: `${isPaused ? 'Paused' : 'Playing'}: "${track.name}" by ${
    //     track.artists[0].name
    //   }`,
    //   timestamp: 'Now',
    // },
    ...queueData
      .map((song: SongObject, index) => ({
        id: `queue-${index}`,
        type: 'song_added',
        title: `"${song.trackTitle}" by ${song.artistName} added to queue`,
        timestamp: song.playing
          ? 'Now Playing'
          : song.upNext
          ? 'Up Next'
          : 'In Queue',
      }))
      .slice(0, 2),
  ].filter(
    (activity): activity is Activity =>
      activity !== null && activity !== undefined,
  );

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>{shortName} - PlebFM Dashboard</title>
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
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {hostName}
          </h1>
          <p className="text-white/60 mt-2 mb-8">
            Here&apos;s what&apos;s happening with your jukebox today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Songs in Queue"
              value={queueData.length.toString()}
              trend={queueData.length > 0 ? 'Active' : 'Empty'}
              icon={<MusicalNoteIcon className="h-6 w-6 text-purple-400" />}
              iconBg="bg-purple-400/10"
            />
            <StatsCard
              title="Total Earned"
              value={`$${(earnings / 100).toFixed(2)}`}
              trend="+15%"
              icon={<CurrencyDollarIcon className="h-6 w-6 text-green-400" />}
              iconBg="bg-green-400/10"
            />
            {/* <StatsCard
              title="Queue Status"
              value={track ? (isPaused ? 'Paused' : 'Playing') : 'Idle'}
              trend={track ? track.name : 'No track'}
              icon={<UsersIcon className="h-6 w-6 text-blue-400" />}
              iconBg="bg-blue-400/10"
            /> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions
              onSkip={() => {
                if (shortName) {
                  fetch(`/api/skip?shortName=${shortName}`, {
                    method: 'POST',
                  });
                }
              }}
              onManageQueue={() => router.push('/host/queue')}
            />
            <RecentActivity activities={recentActivities} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
