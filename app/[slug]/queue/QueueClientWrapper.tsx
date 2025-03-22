'use client';

import { useState, useEffect } from 'react';
import QueueSong from '../../../components/QueueSong';
import LoadingSpinner from '../../../components/Utils/LoadingSpinner';
import { usePusher } from '../../../components/hooks/usePusher';
import { SongObject } from '../../../utils/songs';
import { refreshQueueData } from '../../lib/queue';

interface QueueClientWrapperProps {
  initialQueueData: SongObject[];
  slug: string;
}

export default function QueueClientWrapper({
  initialQueueData,
  slug,
}: QueueClientWrapperProps) {
  const [queueData, setQueueData] = useState<SongObject[]>(initialQueueData);
  const [loading, setLoading] = useState(false);

  // Function to refresh queue data using server action
  const refreshQueue = async () => {
    setLoading(true);
    try {
      const freshData = await refreshQueueData(slug);
      setQueueData(freshData);
    } catch (error) {
      console.error('Error refreshing queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up Pusher for real-time updates
  usePusher(() => {
    refreshQueue();
  });

  // Fallback to client-side fetch if initial data is empty
  useEffect(() => {
    if (initialQueueData.length === 0) {
      refreshQueue();
    }
  }, [initialQueueData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (queueData.length === 0) {
    return (
      <div className="pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
        <div className="p-6 border-b border-white/20 w-full">
          <p>Queue is currently empty. Bid on a song to see it in the queue!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[60px] max-w-screen-sm m-auto pb-36 text-white relative z-50 flex flex-col items-center min-h-screen font-thin">
      {queueData.map((song, key) => (
        <QueueSong key={key} song={song} />
      ))}
    </div>
  );
}
