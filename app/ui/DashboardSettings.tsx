'use client';
import { use, memo, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { SettingsSidebar } from '../../components/Dashboard/SettingsSidebar';
import { GeneralSettings } from '../../components/Settings/GeneralSettings';
import { BillingSettings } from '../../components/Settings/BillingSettings';
import { DashboardContentWrapper } from './DashboardContentWrapper';
import { DashboardData } from '../lib/dashboard';

const AppearanceSettings = memo(function AppearanceSettings() {
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-6">
        Appearance Settings
      </h2>
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <p className="text-white/60">
          Customize how your jukebox looks. Coming soon...
        </p>
      </div>
    </>
  );
});

interface SettingsContentProps {
  section: string;
  host: any;
  currentPlan: any;
  status: string;
}

const SettingsContent = memo(function SettingsContent({
  section,
  host,
  currentPlan,
  status,
}: SettingsContentProps) {
  switch (section) {
    case 'general':
      return (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">
            General Settings
          </h2>
          <GeneralSettings
            hostName={host.hostName}
            shortName={host.shortName}
            hostId={host.hostId}
            baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ''}
          />
        </>
      );

    case 'appearance':
      return <AppearanceSettings />;

    case 'billing':
      return (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">
            Billing & Subscription
          </h2>
          <BillingSettings status={status} currentPlan={currentPlan} />
        </>
      );

    default:
      return null;
  }
});

// Optimize toast configuration to prevent re-renders
const toastOptions = {
  style: {
    background: '#333',
    color: '#fff',
  },
};

const DashboardSettings = memo(function DashboardSettings({
  data,
  section,
  status,
}: {
  data: Promise<DashboardData>;
  section: Promise<string>;
  status: Promise<string>;
}) {
  const { host, currentPlan } = use(data);
  const currentSection = use(section);
  const currentStatus = use(status);

  if (!host) return null;

  return (
    <DashboardContentWrapper
      title="Settings"
      subtitle="Manage your jukebox settings and preferences."
      margin="large"
    >
      <Toaster position="top-center" toastOptions={toastOptions} />
      <div className="flex gap-8">
        <SettingsSidebar section={currentSection} />

        <div className="flex-1 min-w-0">
          <div key={currentSection}>
            <SettingsContent
              section={currentSection}
              host={host}
              currentPlan={currentPlan}
              status={currentStatus}
            />
          </div>
        </div>
      </div>
    </DashboardContentWrapper>
  );
});

export default DashboardSettings;
