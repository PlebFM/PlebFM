// pleb.fm/atl
import { notFound } from 'next/navigation';
import { getHost } from '../../lib/hosts';
import LoadingSpinner from '../../components/Utils/LoadingSpinner';
import { Home } from '../ui/user/Home';
import { Suspense } from 'react';

export default async function Bidding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) notFound();

  const hostPromise = getHost(slug).then(host => {
    if (!host) {
      console.warn('Host not found', slug);
      notFound();
    }
    return host;
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Home host={hostPromise} />
    </Suspense>
  );
}
