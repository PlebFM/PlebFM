import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Host } from '../../models/Host';
import Link from 'next/link';

export default function HostDashboard() {
  const { data: session } = useSession();
  const [host, setHost] = useState<Host | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchHost = async () => {
      try {
        // @ts-ignore - we know id exists from spotify auth
        const res = await fetch(`/api/hosts?spotifyId=${session.user.id}`);
        const data = await res.json();
        setHost(data.hosts[0]);
      } catch (error) {
        console.error('Error fetching host:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHost();
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">No host account found.</p>
          <Link
            href="/host/signup"
            className="text-orange-300 hover:text-orange-200"
          >
            Create a Jukebox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>{host.hostName} - Host Dashboard - PlebFM</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Your Jukebox</h2>
                <p className="text-white/80 text-sm mt-1">{host.hostName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/90">
                  Public URL
                </h3>
                <code className="block bg-white/5 p-2 rounded mt-1 text-sm text-white/80">
                  {`plebfm.com/${host.shortName}`}
                </code>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/host/queue"
                  className="block w-full text-left px-4 py-2 rounded-lg text-white/90 hover:bg-white/5 transition-colors"
                >
                  Queue Manager
                </Link>
                <Link
                  href="/host/settings"
                  className="block w-full text-left px-4 py-2 rounded-lg text-white/90 hover:bg-white/5 transition-colors"
                >
                  Settings
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-medium text-white/80">
                  Current Queue
                </h3>
                <p className="text-2xl font-medium text-white mt-2">0 songs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-medium text-white/80">
                  Total Earned
                </h3>
                <p className="text-2xl font-medium text-white mt-2">0 sats</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-medium text-white/80">
                  Songs Played
                </h3>
                <p className="text-2xl font-medium text-white mt-2">0</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/host/queue"
                  className="flex items-center justify-center px-4 py-3 bg-orange-300/90 hover:bg-orange-300 text-black rounded-lg transition-colors"
                >
                  Open Queue
                </Link>
                <button
                  onClick={() => {
                    /* TODO: Implement skip current */
                  }}
                  className="px-4 py-3 border border-orange-300/50 hover:border-orange-300 text-white rounded-lg transition-colors"
                >
                  Skip Current Song
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Recent Activity
              </h2>
              <div className="text-white/60 text-center py-8">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
