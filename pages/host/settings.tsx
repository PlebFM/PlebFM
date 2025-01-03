import { useState } from 'react';
import {
  DashboardLayout,
  getServerSidePropsForDashboard,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
import { SettingsSidebar } from '../../components/Dashboard/SettingsSidebar';
import { TeamNameSettings } from '../../components/Settings/TeamNameSettings';
import { JukeboxUrlSettings } from '../../components/Settings/JukeboxUrlSettings';
import { DangerZone } from '../../components/Settings/DangerZone';

export default function HostSettings({ host, queueData }: DashboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!host) return null;

  return (
    <DashboardLayout
      host={host}
      title="Settings"
      subtitle="Manage your jukebox settings and preferences."
      margin="large"
    >
      <div className="flex gap-8">
        <SettingsSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex-1 space-y-6 min-w-0">
          <TeamNameSettings hostName={host.hostName} />

          <JukeboxUrlSettings
            shortName={host.shortName}
            baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ''}
          />

          <DangerZone onDelete={() => console.log('Delete jukebox')} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
