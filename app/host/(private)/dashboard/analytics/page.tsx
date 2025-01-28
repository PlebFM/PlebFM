import {
  DashboardLayout,
  DashboardPageProps,
} from '../../../../../components/Dashboard/HostDashboardLayout';

export default function HostAnalytics({ host }: DashboardPageProps) {
  if (!host) return null;

  return (
    <DashboardLayout
      host={host}
      title="Analytics"
      subtitle="Track your jukebox performance and earnings."
      margin="large"
      pathname="/host/dashboard/analytics"
    >
      <div className="text-white">
        {/* Analytics content will go here */}
        Coming soon...
      </div>
    </DashboardLayout>
  );
}
