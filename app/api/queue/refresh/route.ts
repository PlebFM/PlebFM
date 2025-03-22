import { NextResponse } from 'next/server';
import { Play } from '../../../../models/Play';
import { cleanSong } from '../../../../utils/songs';
import { getHost } from '../../../../lib/hosts';
import { withMongo } from '../../../../middleware/mongodb';

// GET handler for refreshing queue data
export const GET = withMongo(async (request: Request) => {
  try {
    // Get the shortName from query parameters
    const { searchParams } = new URL(request.url);
    const shortName = searchParams.get('shortName');

    if (!shortName) {
      return NextResponse.json(
        { error: 'Missing shortName parameter' },
        { status: 400 },
      );
    }

    // Verify the host exists
    const host = await getHost(shortName);

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 });
    }

    // Use API route for now (could be replaced with direct DB access later)
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
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const songs = data.data.map((song: Play) => cleanSong(song));
    return NextResponse.json({ data: songs }, { status: 200 });
  } catch (error) {
    console.error('Error in queue refresh API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
});
