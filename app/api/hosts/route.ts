import { NextRequest, NextResponse } from 'next/server';
import Host from '@/models/Host';
import connectDB from '@/middleware/mongodb';

const GET = connectDB(async (request: NextRequest) => {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    // Find hosts matching query
    const hosts = await Host.find(query);

    return NextResponse.json({ success: true, hosts: hosts });
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hosts' },
      { status: 500 },
    );
  }
});

const PATCH = connectDB(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { spotifyId, shortName, hostName, refreshToken } = body;

    if (!spotifyId) {
      return NextResponse.json(
        { success: false, error: 'spotifyId is required' },
        { status: 400 },
      );
    }

    const host = await Host.findOneAndUpdate(
      { spotifyId },
      { shortName, hostName, hostId: spotifyId, spotifyId, refreshToken },
      { new: true },
    );

    if (host) {
      return NextResponse.json({ success: true, data: host });
    } else {
      return NextResponse.json(
        { success: false, error: 'Host not found' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Error updating host:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update host' },
      { status: 500 },
    );
  }
});

export { GET, PATCH };
