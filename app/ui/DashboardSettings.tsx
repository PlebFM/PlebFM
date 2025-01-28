'use client';
import { use } from 'react';
import { Toaster } from 'react-hot-toast';
import { SettingsSidebar } from '../../components/Dashboard/SettingsSidebar';
import { GeneralSettings } from '../../components/Settings/GeneralSettings';
import { BillingSettings } from '../../components/Settings/BillingSettings';
import { DashboardContentWrapper } from './DashboardContentWrapper';
import { DashboardData } from '../lib/dashboard';

export default function HostSettings({
  data,
  section,
  status,
}: {
  data: Promise<DashboardData>;
  section: Promise<string>;
  status: Promise<string>;
}) {
  const { host } = use(data);

  const currentSection = use(section);
  const currentStatus = use(status);

  if (!host) return null;

  const renderContent = () => {
    switch (currentSection) {
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

      case 'billing':
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              Billing & Subscription
            </h2>
            <BillingSettings status={currentStatus} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardContentWrapper
      title="Settings"
      subtitle="Manage your jukebox settings and preferences."
      margin="large"
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <div className="flex gap-8">
        <SettingsSidebar section={currentSection} />

        <div className="flex-1 min-w-0">
          <div key={currentSection}>{renderContent()}</div>
        </div>
      </div>
    </DashboardContentWrapper>
  );
}
