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
  // const pathName = usePathname()?.replaceAll('/', '');
  const { slug } = await params;

  if (!slug) notFound();

  const host = getHost(slug);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Home host={host} />
    </Suspense>
  );
}
