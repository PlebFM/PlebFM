import Image from 'next/image';
import { notFound } from 'next/navigation';
import NavBar from '../../../components/Utils/NavBar';
import Layout from '../../../components/Utils/Layout';
import { Suspense } from 'react';
import QueueClientWrapper from './QueueClientWrapper';
import { getQueueData } from '../../lib/queue';

export default async function Queue({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) notFound();

  const initialQueueData = await getQueueData(slug);

  return (
    <Layout title="Queue">
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={'/pfm-bokeh-3.jpg'}
          alt="background"
          width={1000}
          height={1000}
          className="object-cover w-full h-full blur-2xl opacity-50"
          priority
        />
      </div>

      <Suspense fallback={<div className="text-white">Loading queue...</div>}>
        <QueueClientWrapper initialQueueData={initialQueueData} slug={slug} />
      </Suspense>

      <NavBar activeBtn="queue" />
    </Layout>
  );
}
