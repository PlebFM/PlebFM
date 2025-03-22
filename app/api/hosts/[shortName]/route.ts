import { NextRequest, NextResponse } from 'next/server';
import Host from '@/models/Host';
import { withMongo } from '@/middleware/mongodb';

// GET handler for fetching a host
export const GET = withMongo(
  async (
    request: NextRequest,
    { params }: { params: { shortName: string } },
  ) => {
    try {
      const { shortName } = params;

      const host = await Host.findOne({ shortName });

      if (!host) {
        return NextResponse.json(
          { success: false, error: 'Host not found.' },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true, host: host });
    } catch (error) {
      console.error('Error fetching host:', error);
      return NextResponse.json(
        { success: false, error: 'Host lookup failed' },
        { status: 500 },
      );
    }
  },
);

// POST handler for creating a host
export const POST = withMongo(
  async (
    request: NextRequest,
    { params }: { params: { shortName: string } },
  ) => {
    try {
      const { shortName } = params;
      const body = await request.json();
      const { hostName, refreshToken, spotifyId } = body;

      if (!hostName) {
        return NextResponse.json(
          { success: false, error: 'hostName must be present' },
          { status: 400 },
        );
      }

      const host = {
        hostName,
        shortName,
        spotifyRefreshToken: refreshToken,
        spotifyId,
        hostId: spotifyId,
      };

      const result = await Host.create(host);

      return NextResponse.json({ success: true, host: result });
    } catch (error) {
      console.error('Error creating host:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create host' },
        { status: 500 },
      );
    }
  },
);
