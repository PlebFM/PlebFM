import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Plan, PLANS } from '../../../../../models/Subscription';
import { Subscription } from '../../../../../models/Subscription';
import { Host } from '../../../../../components/hooks/useHost';
import { auth } from '../../../../../utils/auth';
import { cleanSong, SongObject } from '../../../../../utils/songs';
import LoadingSpinner from '../../../../../components/Utils/LoadingSpinner';
import DashboardSettings from '../../../../ui/DashboardSettings';

export type DashboardData = {
  host: Host;
  queueData: SongObject[];
  subscription: Subscription | null;
  currentPlan: Plan;
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
      currentPlan: subscriptionData.plan || PLANS[0],
    };
  } catch (err) {
    console.error(err);
    throw err instanceof Error
      ? err
      : new Error('Failed to fetch data for dashboard');
  }
};

// Use the simplest form of page component that works with App Router
export default async function SettingsPage({ searchParams }: any) {
  const data = fetchDashboardData();

  // Extract params with defaults
  const section =
    typeof searchParams?.section === 'string'
      ? searchParams.section
      : 'general';
  const status = searchParams?.success
    ? 'success'
    : searchParams?.canceled
    ? 'canceled'
    : '';

  return (
    <Suspense
      fallback={<LoadingSpinner background="black h-[calc(100vh-20rem)]" />}
    >
      <DashboardSettings data={data} section={section} status={status} />
    </Suspense>
  );
}
