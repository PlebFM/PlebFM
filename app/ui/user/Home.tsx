import { Suspense } from 'react';
import { Host } from '../../../models/Host';
import LoadingSpinner from '../../../components/Utils/LoadingSpinner';
import HomeContainer from './HomeContainer';

export const Home = ({ host }: { host: Promise<void | Host> }) => {
  try {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <HomeContainer host={host} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading host:', error);
    return <div>Error loading jukebox. Please try again.</div>;
  }
};
