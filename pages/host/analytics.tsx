import {
  DashboardLayout,
  getServerSidePropsForDashboard,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';

export default function HostAnalytics({ host, queueData }: DashboardPageProps) {
  if (!host) return null;

  return (
    <DashboardLayout
      host={host}
      title="Analytics"
      subtitle="Track your jukebox performance and earnings."
      margin="large"
    >
      <div className="text-white">
        {/* Analytics content will go here */}
        Coming soon...
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
