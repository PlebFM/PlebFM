import {
  DashboardLayout,
  DashboardPageProps,
} from '../../../../../components/Dashboard/HostDashboardLayout';

export default function HostAnalytics(props: DashboardPageProps) {
  if (!props.host) return null;

  return (
    <DashboardLayout
      host={props.host}
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
