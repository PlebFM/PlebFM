import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Hosts from '../../../models/Host';
import fs from 'fs';
import path from 'path';
import {
  getPlaylist,
  createPlaylist,
  setPlaylistCoverImage,
} from '../../../lib/spotify';
import connectDB from '../../../middleware/mongodb';
import withJukebox from '../../../middleware/withJukebox';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // const session = await getSession({ req });
  // console.log('----session', session);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const spotifyId = req.query.spotifyId as string;
  const host = await Hosts.findOne({ spotifyId: spotifyId });

  const accessToken = req.headers.accessToken as string;

  // const session = await auth(req, res);

  if (!host) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check if host has a banned songs playlist
    if (host.settings?.bannedSongsPlaylist?.id) {
      console.log(
        'FOUND BANNED SONGS PLAYLIST ID',
        host.settings.bannedSongsPlaylist.id,
      );
      try {
        // Try to fetch the existing playlist
        const playlist = await getPlaylist(
          host.settings.bannedSongsPlaylist.id,
          accessToken,
        );
        console.log('spotify PLAYLIST', playlist);
        return res.status(200).json({
          playlistId: playlist.id,
          tracks: playlist.tracks.items
            .map((item: any) => item.track?.id)
            .filter(Boolean),
        });
      } catch (error) {
        // Playlist not found or inaccessible, create new one
        console.log('Existing playlist not found, creating new one');
      }
    }
    // Create new playlist
    const newPlaylist = await createPlaylist(
      spotifyId,
      'PlebFM - Banned Songs',
      'Songs banned from your PlebFM jukebox',
      false,
      accessToken,
    );

    // Set playlist cover image
    try {
      const imagePath = path.join(process.cwd(), 'public', 'plebfm.jpg');
      const imageBuffer = await fs.promises.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      await setPlaylistCoverImage(newPlaylist.id, base64Image, accessToken);
    } catch (error) {
      console.error('Failed to set playlist cover image:', error);
      // Continue anyway since this is not critical
    }

    // Update host with new playlist
    await Hosts.updateOne(
      { spotifyId },
      {
        $set: {
          'settings.bannedSongsPlaylist': {
            id: newPlaylist.id,
            url: newPlaylist.external_urls.spotify,
          },
        },
      },
    );

    return res.status(200).json({
      playlistId: newPlaylist.id,
    });
  } catch (error) {
    console.error('Error in banned-playlist handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// export default handler;
export default connectDB(withJukebox(handler));
