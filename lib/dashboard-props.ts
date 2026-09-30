import type { DashboardPageProps } from '../components/Dashboard/HostDashboardLayout';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { ensureDB } from './db';
import { dashboardData } from './dashboard';
import { cleanSong } from '../utils/songs';
export const getServerSidePropsForDashboard: GetServerSideProps<
  DashboardPageProps
> = async context => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user?.id || session.error)
    return { redirect: { destination: '/host/login', permanent: false } };
  await ensureDB();
  const data = await dashboardData(session.user.id);
  if (!data)
    return { redirect: { destination: '/host/signup', permanent: false } };
  return {
    props: JSON.parse(
      JSON.stringify({
        ...data,
        queueData: data.queueData.map(song => cleanSong(song)),
      }),
    ),
  };
};
