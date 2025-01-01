import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Host } from '../../models/Host';
import Link from 'next/link';
import Image from 'next/image';
import plebFMLogo from '../../public/plebfm-logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  QueueListIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  MusicalNoteIcon,
  CurrencyDollarIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <p className="mb-4">No host account found.</p>
          <Link
            href="/host/signup"
            className="text-orange-300 hover:text-orange-200"
          >
            Create a Jukebox
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto">
      <Head>
        <title>{host.hostName} - Host Dashboard - PlebFM</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#000000" />
      </Head>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4">
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
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                Logout
              </button>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-2 space-y-1 overflow-hidden"
              >
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
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <motion.main
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        {/* Welcome Section */}
        <motion.div variants={fadeIn} className="mb-8">
          <h1 className="text-2xl font-medium text-white">Welcome back!</h1>
          <p className="text-white/60 mt-1">
            Here&apos;s what&apos;s happening with your jukebox today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8"
        >
          {[
            {
              title: 'Current Queue',
              value: '0 songs',
              trend: '12% more',
              icon: <QueueListIcon className="h-6 w-6 text-orange-400" />,
              iconBg: 'bg-orange-400/10',
            },
            {
              title: 'Total Earned',
              value: '0 sats',
              trend: '8% more',
              icon: <CurrencyDollarIcon className="h-6 w-6 text-green-400" />,
              iconBg: 'bg-green-400/10',
            },
            {
              title: 'Songs Played',
              value: '0',
              trend: '23% more',
              icon: <MusicalNoteIcon className="h-6 w-6 text-purple-400" />,
              iconBg: 'bg-purple-400/10',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={fadeIn}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400">{stat.trend}</span>
                <span className="text-white/40 ml-1.5">vs last week</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Queue Manager */}
          <motion.div
            variants={fadeIn}
            className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  /* TODO: Implement skip */
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
              >
                <QueueListIcon className="h-5 w-5" />
                Manage Queue
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  /* TODO: Implement skip */
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
              >
                <ChartBarIcon className="h-5 w-5" />
                View Stats
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Actions & Settings */}
          <motion.div
            variants={staggerChildren}
            className="space-y-4 md:space-y-8"
          >
            {/* Quick Actions */}
            <motion.div
              variants={fadeIn}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {[
                  {
                    text: 'Skip Current Song',
                    icon: <ChartBarIcon className="h-5 w-5 text-white/60" />,
                  },
                  {
                    text: 'Pause Queue',
                    icon: <QueueListIcon className="h-5 w-5 text-white/60" />,
                  },
                  {
                    text: 'Settings',
                    icon: <Cog6ToothIcon className="h-5 w-5 text-white/60" />,
                    href: '/host/settings',
                  },
                ].map((action, index) =>
                  action.href ? (
                    <motion.div key={action.text} variants={fadeIn}>
                      <Link
                        href={action.href}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                      >
                        <span>{action.text}</span>
                        {action.icon}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.button
                      key={action.text}
                      variants={fadeIn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                    >
                      <span>{action.text}</span>
                      {action.icon}
                    </motion.button>
                  ),
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={fadeIn}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Recent Activity
              </h2>
              <div className="text-white/40 text-center py-8">
                No recent activity
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
