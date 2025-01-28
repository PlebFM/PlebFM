import { Suspense } from 'react';
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
