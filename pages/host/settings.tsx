import { useState } from 'react';
import {
  DashboardLayout,
  getServerSidePropsForDashboard,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
import { SettingsSidebar } from '../../components/Dashboard/SettingsSidebar';

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
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Team Name</h2>
            <p className="text-sm text-white/60 mb-4">
              This is your jukebox&apos;s visible name to your customers.
            </p>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <input
                type="text"
                value={host.hostName}
                className="block w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your jukebox name"
              />
              <p className="mt-2 text-xs text-white/40">
                Please use 32 characters at maximum.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white mb-1">Jukebox URL</h2>
            <p className="text-sm text-white/60 mb-4">
              Your jukebox&apos;s unique URL where customers can request songs.
            </p>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex rounded-md">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-white/40 text-sm">
                  {process.env.NEXT_PUBLIC_BASE_URL}/
                </span>
                <input
                  type="text"
                  value={host.shortName}
                  className="block w-full bg-black border border-white/10 rounded-none rounded-r-md px-3 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your-jukebox-name"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white mb-1">Danger Zone</h2>
            <p className="text-sm text-white/60 mb-4">
              Irreversible and destructive actions.
            </p>
            <div className="bg-white/5 rounded-lg border border-red-500/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Delete Jukebox
                  </h3>
                  <p className="text-sm text-white/60">
                    Permanently delete your jukebox and all of its data.
                  </p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
