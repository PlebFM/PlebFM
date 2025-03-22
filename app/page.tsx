import { Metadata } from 'next/types';
import { LandingPage } from '../components/Landing/LandingPage';

export default async function Index() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch hosts');
  }
  const hosts = data.hosts;
  const error = data.error;

  return <LandingPage hosts={hosts} error={error} />;
}

export const metadata: Metadata = {
  title: 'PlebFM',
  description: 'PlebFM',
};
