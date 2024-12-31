import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Host } from '../../models/Host';
import Link from 'next/link';
import Image from 'next/image';
import plebFMLogo from '../../public/plebfm-logo.svg';
import {
  ChartBarIcon,
  QueueListIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  MusicalNoteIcon,
  CurrencyDollarIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function HostDashboard() {
  const { data: session } = useSession();
  const [host, setHost] = useState<Host | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Head>
        <title>{host.hostName} - Host Dashboard - PlebFM</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>

      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src={plebFMLogo}
                alt="PlebFM"
                className="h-8 w-auto"
                width={120}
              />
              <div className="hidden md:flex ml-8 space-x-4">
                <Link
                  href="/host/dashboard"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/host/queue"
                  className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Queue
                </Link>
                <Link
                  href="/host/analytics"
                  className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </Link>
                <Link
                  href="/host/settings"
                  className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href={`/${host.shortName}`}
                className="text-xs bg-white/5 hover:bg-white/10 text-white/70 px-3 py-1.5 rounded-full transition-colors"
                target="_blank"
              >
                View Public Page
              </Link>
              <div className="text-sm text-white/50">{host.hostName}</div>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 space-y-1">
              <Link
                href="/host/dashboard"
                className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/host/queue"
                className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Queue
              </Link>
              <Link
                href="/host/analytics"
                className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/host/settings"
                className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Settings
              </Link>
              <Link
                href={`/${host.shortName}`}
                className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                target="_blank"
              >
                View Public Page
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">Welcome back!</h1>
          <p className="text-white/60 mt-1">
            Here&apos;s what&apos;s happening with your jukebox today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Current Queue
                </p>
                <p className="text-2xl font-semibold text-white mt-1">
                  0 songs
                </p>
              </div>
              <div className="bg-orange-400/10 p-3 rounded-xl">
                <QueueListIcon className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">12% more</span>
              <span className="text-white/40 ml-1.5">vs last week</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Total Earned
                </p>
                <p className="text-2xl font-semibold text-white mt-1">0 sats</p>
              </div>
              <div className="bg-green-400/10 p-3 rounded-xl">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">8% more</span>
              <span className="text-white/40 ml-1.5">vs last week</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Songs Played
                </p>
                <p className="text-2xl font-semibold text-white mt-1">0</p>
              </div>
              <div className="bg-purple-400/10 p-3 rounded-xl">
                <MusicalNoteIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">23% more</span>
              <span className="text-white/40 ml-1.5">vs last week</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Queue Manager */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white">Queue Manager</h2>
              <Link
                href="/host/queue"
                className="text-sm text-orange-300 hover:text-orange-200"
              >
                View All
              </Link>
            </div>
            <div className="text-white/40 text-center py-12">
              No songs in queue
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  /* TODO: Implement skip */
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
              >
                <QueueListIcon className="h-5 w-5" />
                Manage Queue
              </button>
              <button
                onClick={() => {
                  /* TODO: Implement skip */
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
              >
                <ChartBarIcon className="h-5 w-5" />
                View Stats
              </button>
            </div>
          </div>

          {/* Quick Actions & Settings */}
          <div className="space-y-4 md:space-y-8">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-medium text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    /* TODO: Implement skip */
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                >
                  <span>Skip Current Song</span>
                  <ChartBarIcon className="h-5 w-5 text-white/60" />
                </button>
                <button
                  onClick={() => {
                    /* TODO: Implement pause */
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                >
                  <span>Pause Queue</span>
                  <QueueListIcon className="h-5 w-5 text-white/60" />
                </button>
                <Link
                  href="/host/settings"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                >
                  <span>Settings</span>
                  <Cog6ToothIcon className="h-5 w-5 text-white/60" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-medium text-white mb-4">
                Recent Activity
              </h2>
              <div className="text-white/40 text-center py-8">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
