import Image from 'next/image';
import bokeh3 from '../../../../public/pfm-bokeh-3.jpg';
import NavBar from '../../../components/Utils/NavBar';
import QueueSong from '../../../components/QueueSong';
import LoadingSpinner from '../../../components/Utils/LoadingSpinner';
import Layout from '../../../components/Utils/Layout';
import { usePusher } from '../../../components/hooks/usePusher';
import { useQueue } from '../../../components/hooks/useQueue';

export default function Queue() {
  const { queueData, loading, refreshQueue } = useQueue();

  usePusher(() => refreshQueue());

  const EmptyQueue = () => {
    return (
      <div className="pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
        <div className="p-6 border-b border-white/20 w-full">
          <p>
            {' '}
            Queue is currently empty. Bid on a song to see it in the queue!{' '}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Queue">
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={bokeh3}
          alt=""
          width="100"
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : queueData.length === 0 ? (
        <EmptyQueue />
      ) : (
        <div className="pb-[60px] max-w-screen-sm m-auto pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
          {queueData.map((song, key) => (
            <QueueSong key={key} song={song} />
          ))}
        </div>
      )}

      <NavBar activeBtn="queue" />
    </Layout>
  );
}
