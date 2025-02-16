import { redirect } from 'next/navigation';
import { Host } from '../../components/hooks/useHost';
import { Plan, Subscription } from '../../models/Subscription';
import { auth } from '../../utils/auth';
import { cleanSong, SongObject } from '../../utils/songs';

export type DashboardPageProps = {
  data: Promise<DashboardData>;
};

export type DashboardData = {
  host: Host;
  queueData: SongObject[];
  subscription: Subscription | null;
  currentPlan: Plan;
};

export const fetchDashboardData = async (
  allowUnauthenticated: boolean = false,
): Promise<DashboardData | null> => {
  const session = await auth();

  if (!session?.user?.id) {
    if (allowUnauthenticated) return null;

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
