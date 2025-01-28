import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Plan } from '../../../../models/Subscription';
import { Subscription } from '../../../../models/Subscription';
import { Host } from '../../../../components/hooks/useHost';
import { auth } from '../../../../utils/auth';
import { cleanSong, SongObject } from '../../../../utils/songs';
import HostDashboard from '../../../ui/HostDashboard';
import LoadingSpinner from '../../../../components/Utils/LoadingSpinner';
import { fetchDashboardData } from '../../../lib/dashboard';

export default function HostDashboardPage({ params }: { params: string }) {
  const data = fetchDashboardData();

  return (
    <Suspense
      fallback={<LoadingSpinner background="black h-[calc(100vh-8rem)]" />}
    >
      <HostDashboard data={data} pathname={params} />
    </Suspense>
  );
}
