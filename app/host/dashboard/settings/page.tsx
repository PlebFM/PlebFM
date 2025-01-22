import {
  DashboardLayout,
  DashboardPageProps,
} from '../../../../components/Dashboard/HostDashboardLayout';

export default function HostSettings({ host }: DashboardPageProps) {
  if (!host) return null;

  return (
    <DashboardLayout
      host={host}
      title="Settings"
      subtitle="Manage your jukebox settings."
      margin="large"
      pathname="/host/dashboard/settings"
    >
      <div className="text-white">
        {/* Analytics content will go here */}
        Coming soon...
      </div>
    </DashboardLayout>
  );
}
