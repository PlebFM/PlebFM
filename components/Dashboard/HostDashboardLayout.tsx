import { useState, ReactNode } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Header } from './Header';
import type { Host } from '../hooks/useHost';
import { cleanSong } from '../../utils/songs';

type MarginSize = 'small' | 'medium' | 'large';

const marginSizes: Record<MarginSize, string> = {
  small: 'max-w-7xl',
  medium: 'max-w-6xl',
  large: 'max-w-5xl',
};

interface HostDashboardLayoutProps {
  children: ReactNode;
  host: Host;
  title: string;
  subtitle?: string;
  margin?: MarginSize;
}

export interface DashboardPageProps {
  host: Host | null;
  queueData: any[];
}

export function DashboardLayout({
  children,
  host,
  title,
  subtitle,
  margin = 'medium',
}: HostDashboardLayoutProps) {
  if (!host) return null;

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>{title} - PlebFM</title>
      </Head>

      <Header hostName={host.hostName} shortName={host.shortName} />

      <main className={`${marginSizes[margin]} mx-auto px-4 py-8`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/60 mt-2 mb-8">{subtitle}</p>}
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export const getServerSidePropsForDashboard: GetServerSideProps<
  DashboardPageProps
> = async context => {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: '/host/login',
        permanent: false,
      },
    };
  }

  try {
    const hostRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts?spotifyId=${session.user.id}`,
    );
    const hostData = await hostRes.json();

    if (hostData.hosts.length === 0) {
      return {
        redirect: {
          destination: '/host/signup',
          permanent: false,
        },
      };
    }

    const host = hostData.hosts[0];

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/leaderboard/queue?playing=${true}&shortName=${host.shortName}`;
    const queueRes = await fetch(url);
    const queue = await queueRes.json();

    return {
      props: {
        host,
        queueData: queue.data.map(cleanSong) || [],
      },
    };
  } catch (err) {
    console.error(err);
    throw err instanceof Error
      ? err
      : new Error('Failed to fetch data for dashboard');
  }
};
