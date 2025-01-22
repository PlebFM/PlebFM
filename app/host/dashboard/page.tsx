import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Plan } from '../../../models/Subscription';
import { Subscription } from '../../../models/Subscription';
import { Host } from '../../../components/hooks/useHost';
import { auth } from '../../../utils/auth';
import { cleanSong, SongObject } from '../../../utils/songs';
import HostDashboard from '../../ui/HostDashboard';

export type DashboardPageProps = {
  data: Promise<DashboardData>;
};

export type DashboardData = {
  host: Host | null;
  queueData: SongObject[];
  subscription: Subscription | null;
  currentPlan: Plan | null;
};

const fetchDashboardData = async (): Promise<DashboardData> => {
  const session = await auth();

  if (!session?.user?.id) {
    console.log('No session found, redirecting to login');
    redirect('/host/login');
  }

  try {
    const hostRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts?spotifyId=${session.user.id}`,
    );
    const hostData = await hostRes.json();

    if (hostData.hosts.length === 0) {
      console.log('No host found, redirecting to signup');
      redirect('/host/signup');
    }

    const host = hostData.hosts[0];

    // Fetch queue data
    const queueUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/leaderboard/queue?playing=${true}&shortName=${host.shortName}`;
    const queueRes = await fetch(queueUrl);
    const queue = await queueRes.json();

    // Fetch subscription data
    const subscriptionRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscriptions/current`,
    );
    const subscriptionData = await subscriptionRes.json();

    return {
      host,
      queueData: queue.data.map(cleanSong) || [],
      subscription: subscriptionData.subscription || null,
      currentPlan: subscriptionData.plan || null,
    };
  } catch (err) {
    console.error(err);
    throw err instanceof Error
      ? err
      : new Error('Failed to fetch data for dashboard');
  }
};

export default function HostDashboardPage({ params }: { params: string }) {
  const data = fetchDashboardData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostDashboard data={data} pathname={params} />
    </Suspense>
  );
}
