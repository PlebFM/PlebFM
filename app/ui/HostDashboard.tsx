'use client';

import { use, useState } from 'react';
import {
  MusicalNoteIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '../../components/Dashboard/HostDashboardLayout';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { QuickActions } from '../../components/Dashboard/QuickActions';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import type { Activity } from '../../components/Dashboard/RecentActivity';
import type { SongObject } from '../../utils/songs';
import { DashboardData } from '../host/dashboard/page';
import { SessionProvider } from 'next-auth/react';

export default function HostDashboard({
  data,
  pathname,
}: {
  data: Promise<DashboardData>;
  pathname: string;
}) {
  const { host, queueData } = use(data);
  const [earnings, setEarnings] = useState(0);

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
    <SessionProvider>
      <DashboardLayout
        host={host}
        title="Welcome back"
        subtitle="Here's what's happening with your jukebox today."
        margin="large"
        pathname={pathname}
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
            value={`$${(earnings / 100).toFixed(2)}`}
            trend="+15%"
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-400" />}
            iconBg="bg-green-400/10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActions
            onSkip={() => {
              if (host.shortName) {
                fetch(`/api/skip?shortName=${host.shortName}`, {
                  method: 'POST',
                });
              }
            }}
            onManageQueue={() => window.open('/host/queue', '_blank')}
          />
          <RecentActivity activities={recentActivities} />
        </div>
      </DashboardLayout>
    </SessionProvider>
  );
}
