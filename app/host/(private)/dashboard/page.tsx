import { Suspense } from 'react';
import HostDashboard from '../../../ui/HostDashboard';
import LoadingSpinner from '../../../../components/Utils/LoadingSpinner';
import { fetchDashboardData } from '../../../lib/dashboard';

export default function HostDashboardPage() {
  const data = fetchDashboardData();

  return (
    <Suspense
      fallback={<LoadingSpinner background="black h-[calc(100vh-20rem)]" />}
    >
      <HostDashboard data={data} pathname="dashboard" />
    </Suspense>
  );
}
