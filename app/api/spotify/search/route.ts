import { NextRequest, NextResponse } from 'next/server';
import { searchTrack } from '@/lib/spotify';
import Host from '@/models/Host';
import connectDB from '@/middleware/mongodb';
import { getAccessToken } from '@/lib/spotify';

async function GET(request: NextRequest) {
  // Get the query parameters from the URL
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const limit = searchParams.get('limit') || '20';
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
    const response = await searchTrack(query, accessToken, limit);

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to search for tracks' },
        { status: 400 },
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in Spotify search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export default connectDB(GET);
