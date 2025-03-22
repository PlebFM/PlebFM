import { NextRequest, NextResponse } from 'next/server';
import { getPlaybackState, getAccessToken } from '@/lib/spotify';
import Host from '@/models/Host';
import { withMongo } from '@/middleware/mongodb';

// GET handler for retrieving Spotify playback state
export const GET = withMongo(async (req: NextRequest) => {
  // Get the query parameters from the URL
  const searchParams = req.nextUrl.searchParams;
  const shortName = searchParams.get('shortName');

  if (!shortName) {
    return NextResponse.json(
      { error: 'Bad request: requires shortName parameter' },
      { status: 400 },
    );
  }

  try {
    // Find the host by shortName
    const customer = await Host.findOne({ shortName: shortName });

    if (!customer) {
      return NextResponse.json(
        { error: `Jukebox with name "${shortName}" not found` },
        { status: 400 },
      );
    }

    const refreshToken = customer.spotifyRefreshToken;
    const accessTokenResponse = await getAccessToken(refreshToken);

    if (!accessTokenResponse) {
      return NextResponse.json(
        { error: 'Could not fetch Spotify access token' },
        { status: 400 },
      );
    }

    const accessToken = accessTokenResponse.access_token;
    const response = await getPlaybackState(accessToken);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in Spotify playback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
});
