import { Host } from '../../../models/Host';
import { Suspense } from 'react';
import LoadingSpinner from '../../../components/Utils/LoadingSpinner';
import FlowRouter from './FlowRouter';

export default function HomeContainer({
  host,
}: {
  host: Promise<Host | void>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FlowRouter host={host} />
    </Suspense>
  );
}
