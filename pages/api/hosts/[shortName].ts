import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Hosts, { Host } from '../../../models/Host';
import { PUBLIC_HOST_PROJECTION, toPublicHost } from '../../../lib/publicHost';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { shortName } = req.query;
    // Gets list of hosts
    if (req.method === 'GET') {
      const host = await Hosts.findOne(
        { shortName: shortName },
        PUBLIC_HOST_PROJECTION,
      );
      if (!host)
        return res
          .status(400)
          .json({ success: false, error: 'Host not found.' });

      return res.status(200).json({ success: true, host: toPublicHost(host) });

      // Adds new host
    } else if (req.method === 'POST') {
      const { hostName, shortName, refreshToken, spotifyId } = req.body;
      if (!hostName)
        res.status(400).json({ error: `hostName must be present` });
      const host: Host = {
        hostName,
        shortName,
        spotifyRefreshToken: refreshToken,
        spotifyId,
        hostId: spotifyId,
      };
      const result = await Hosts.create(host);
      res.status(200).json({ success: true, host: toPublicHost(result) });
    }
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, error: 'host lookup failed' });
  }
};

export default connectDB(handler);
