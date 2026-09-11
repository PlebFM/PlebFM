import { getServerSidePropsForDashboard } from '../../lib/dashboard-props';
import { useState } from 'react';
import {
  MusicalNoteIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import {
  DashboardLayout,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { QuickActions } from '../../components/Dashboard/QuickActions';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import type { Activity } from '../../components/Dashboard/RecentActivity';
import type { SongObject } from '../../utils/songs';

export default function HostDashboard({
  host,
  queueData,
  stats,
}: DashboardPageProps) {
  const [message, setMessage] = useState('');

  if (!host) return null;

  const recentActivities: Activity[] = [
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
    <DashboardLayout
      host={host}
      title="Welcome back"
      subtitle="Here's what's happening with your jukebox today."
      margin="large"
    >
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
          value={`${stats.earnedSats.toLocaleString()} sats`}
          trend={`${stats.balanceSats.toLocaleString()} sats available`}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-400" />}
          iconBg="bg-green-400/10"
        />
      </div>

      {message && (
        <p role="status" className="text-white mb-4">
          {message}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActions
          onSkip={async () => {
            try {
              const res = await fetch('/api/skip', { method: 'POST' });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              setMessage('Skipped the current song.');
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
          onManageQueue={() => window.open('/host/queue', '_blank')}
        />
        <RecentActivity activities={recentActivities} />
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
