import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import Hosts, { Host } from '../../models/Host';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Gets list of hosts
  const queries = req.query;
  const hosts: Host[] = await Hosts.find({ filter: queries });
  if (req.method === 'GET') {
    // return res.status(200).json({success: true, hosts: hosts});
    return res.status(200).send({ success: true, hosts: hosts });
    // Adds new host
  } else if (req.method === 'POST') {
    const { hostId, hostName, shortName, refreshToken } = JSON.parse(req.body);
    if (!hostName) return res.status(400).json({ error: `hostName must be present` });
    if (!shortName) return res.status(400).json({ error: `shortName must be present` });
    if (!refreshToken) return res.status(400).json({ error: `refreshToken must be present` });
    const host: Host = {
      hostId: hostId,
      hostName: hostName,
      shortName: shortName,
      spotifyRefreshToken: refreshToken
    }
    const findRes = hosts.find(x => x.spotifyRefreshToken === refreshToken);

    if (findRes) {
      return res.status(400).json({ success: false, error: `host already exists` });
    }

    const result = await Hosts.create(host).catch(e => {
      console.error('Failed to create host', e);
      return null;
    });
    return res.status(200).json({ success: true, host: result });
  }
}

export default connectDB(handler);
