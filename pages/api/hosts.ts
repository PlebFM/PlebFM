import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import Hosts, { Host } from '../../models/Host';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Gets list of hosts
  if (req.method === 'GET') {
    console.error('GET', req.query);
    const hosts: Host[] = await Hosts.find(req.query);
    console.error('HOSTS', hosts);
    return res.status(200).send({ success: true, hosts: hosts });
  }
  // Adds new host
  else if (req.method === 'POST') {
    const { refreshToken, spotifyId } = req.body;
    const session = await getServerSession(req, res, authOptions);
    console.error('----POST', req.body, session);
    if (!session) return res.status(401).json({ error: `Unauthorized` });
    if (!refreshToken)
      return res.status(400).json({ error: `refreshToken must be present` });
    if (!spotifyId)
      return res.status(400).json({ error: `spotifyId must be present` });

    const host: Host = {
      spotifyRefreshToken: refreshToken,
      spotifyId,
    };

    const findRes = await Hosts.findOne({ spotifyId });

    if (findRes) {
      return res
        .status(400)
        .json({ success: false, error: `host already exists` });
    }

    const result = await Hosts.create(host).catch(e => {
      console.error('Failed to create host', e);
      return null;
    });

    console.error('RESULT', result);

    return res.status(200).json({ success: true, host: result });
  }
  // Updates host refresh token
  else if (req.method === 'PATCH') {
    const { spotifyId, shortName, hostName } = req.body;
    const host = await Hosts.findOneAndUpdate(
      { spotifyId },
      { shortName, hostName },
      { new: true },
    );
    if (host) {
      return res.status(200).json({ success: true, data: host });
    } else {
      return res.status(400).json({ success: false, error: `host not found` });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default connectDB(handler);
