import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import {
  MusicalNoteIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import { Header } from '../../components/Dashboard/Header';
import { MobileMenu } from '../../components/Dashboard/MobileMenu';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { QuickActions } from '../../components/Dashboard/QuickActions';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import type { Activity } from '../../components/Dashboard/RecentActivity';
import { cleanSong, SongObject } from '../../utils/songs';
import type { Host } from '../../components/hooks/useHost';

interface DashboardProps {
  host: Host | null;
  queueData: SongObject[];
}

export default function HostDashboard({ host, queueData }: DashboardProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [earnings, setEarnings] = useState(0);

  if (!host) return null;

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
        <title>Dashboard - PlebFM</title>
      </Head>

      <Header
        hostName={host.hostName}
        shortName={host.shortName}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        shortName={host.shortName}
        setMobileMenuOpen={setMobileMenuOpen}
      />

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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions
              onSkip={() => {
                if (host.shortName) {
                  fetch(`/api/skip?shortName=${host.shortName}`, {
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

export const getServerSideProps: GetServerSideProps<
  DashboardProps
> = async context => {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: '/host/login',
        permanent: false,
      },
    };
  }

  try {
    // Fetch host data
    const hostRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts?spotifyId=${session.user.id}`,
    );
    const hostData = await hostRes.json();

    if (hostData.hosts.length === 0) {
      return {
        redirect: {
          destination: '/host/signup',
          permanent: false,
        },
      };
    }

    const host = hostData.hosts[0];

    // Fetch queue data
    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/leaderboard/queue?playing=${true}&shortName=${host.shortName}`;
    const queueRes = await fetch(url);
    const queue = await queueRes.json();

    return {
      props: {
        host,
        queueData: queue.data.map(cleanSong) || [],
      },
    };
  } catch (err) {
    console.error(err);
    throw err instanceof Error
      ? err
      : new Error('Failed to fetch data for dashboard');
  }
};
