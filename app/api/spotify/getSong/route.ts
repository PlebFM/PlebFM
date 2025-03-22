import { NextRequest, NextResponse } from 'next/server';
import { getTrack, getAccessToken } from '@/lib/spotify';
import Host from '@/models/Host';
import connectDB from '@/middleware/mongodb';

// Connect to MongoDB before handling request
const mongoHandler = connectDB(async (req: NextRequest) => {
  // Get the query parameters from the URL
  const searchParams = req.nextUrl.searchParams;
  const trackId = searchParams.get('id');
  const shortName = searchParams.get('shortName');

  if (!trackId) {
    return NextResponse.json(
      { error: 'Bad request: requires id parameter' },
      { status: 400 },
    );
  }

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
    const response = await getTrack(trackId, accessToken);

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to get track details' },
        { status: 400 },
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in Spotify getSong API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
});

export const GET = mongoHandler;
