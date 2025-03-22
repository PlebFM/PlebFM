'use server';

import { notFound } from 'next/navigation';
import { SongObject } from '../../utils/songs';
import { Play } from '../../models/Play';
import { cleanSong } from '../../utils/songs';
import { getHost } from '../../lib/hosts';

/**
 * Fetches queue data for a given jukebox shortname
 * This is a server action that can be called from client components
 */
export async function getQueueData(shortName: string): Promise<SongObject[]> {
  try {
    // Verify the host exists
    const host = await getHost(shortName);

    if (!host) {
      notFound();
    }

    // Use API route for now (later could be replaced with direct DB access)
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || ''
      }/api/leaderboard/queue?playing=true&shortName=${shortName}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch queue data');
    }

    const data = await response.json();

    if (!data?.data) {
      return [];
    }

    const songs = data.data.map((song: Play) => cleanSong(song));
    return songs;
  } catch (error) {
    console.error('Error fetching queue data:', error);
    return [];
  }
}

/**
 * Refreshes queue data for real-time updates
 * This can be exposed as a server action to client components
 */
export async function refreshQueueData(
  shortName: string,
): Promise<SongObject[]> {
  return getQueueData(shortName);
}
