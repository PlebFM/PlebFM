import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  DashboardLayout,
  getServerSidePropsForDashboard,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
import { SettingsSidebar } from '../../components/Dashboard/SettingsSidebar';
import { TeamNameSettings } from '../../components/Settings/TeamNameSettings';
import { JukeboxUrlSettings } from '../../components/Settings/JukeboxUrlSettings';
import { DangerZone } from '../../components/Settings/DangerZone';

// toast('Hello World', {
//   duration: 4000,
//   position: 'top-center',

//   // Styling
//   style: {},
//   className: '',

//   // Custom Icon
//   icon: '👏',

//   // Change colors of success/error/loading icon
//   iconTheme: {
//     primary: '#000',
//     secondary: '#fff',
//   },

//   // Aria
//   ariaProps: {
//     role: 'status',
//     'aria-live': 'polite',
//   },

//   // Additional Configuration
//   removeDelay: 1000,
// });

export default function HostSettings({ host, queueData }: DashboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  if (!host) return null;

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

        <div className="flex-1 space-y-6 min-w-0">
          <TeamNameSettings hostName={host.hostName} />

          <JukeboxUrlSettings
            shortName={host.shortName}
            baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ''}
          />

          <div>
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center text-white/60 hover:text-white transition-colors"
            >
              <svg
                className={`w-4 h-4 mr-2 transition-transform ${
                  isAdvancedOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Advanced Settings
            </button>

            {isAdvancedOpen && (
              <div className="mt-4">
                <DangerZone onDelete={() => console.log('Delete jukebox')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
