import { getServerSidePropsForDashboard } from '../../lib/dashboard-props';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import {
  DashboardLayout,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
import { SettingsSidebar } from '../../components/Dashboard/SettingsSidebar';
import { GeneralSettings } from '../../components/Settings/GeneralSettings';
import { BillingSettings } from '../../components/Settings/BillingSettings';
import { AppearanceSettings } from '../../components/Settings/AppearanceSettings';
import { PayoutSettings } from '../../components/Settings/PayoutSettings';

export default function HostSettings({ host, queueData }: DashboardPageProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentSection = (router.query.section as string) || 'general';

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
            <AppearanceSettings
              color={host.accentColor}
              message={host.welcomeMessage}
            />
          </>
        );

      case 'billing':
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              Billing & Subscription
            </h2>
            <BillingSettings hostId={host.hostId} />
            <div className="mt-6">
              <PayoutSettings />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      host={host}
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
        <SettingsSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex-1 min-w-0">
          <div key={currentSection}>{renderContent()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
