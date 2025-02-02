import { redirect } from 'next/navigation';
import React from 'react';
import { Leaderboard } from '../../ui/queue/Leaderboard';
import { auth } from '../../../utils/auth';
// import { Header } from '../../ui/Header';
// import { Footer } from '../../ui/Footer';

export default async function Queue() {
  const session = await auth();
  if (!session?.user?.id) {
    console.log('No session found, redirecting to login');
    redirect('/host/login?route=/host/queue');
  }

  const hostRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts?spotifyId=${session.user.id}`,
  );
  const hostData = await hostRes.json();

  if (hostData.hosts.length === 0) {
    console.log('No host found, redirecting to signup');
    redirect('/host/signup');
  }

  const host = hostData.hosts[0];

  console.log('session', session);

  return (
    <>
      <Leaderboard
        status={session.status}
        error={session.error}
        accessToken={session.accessToken}
        shortName={host.shortName}
      />
    </>
  );
}
