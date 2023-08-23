import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import Hosts, { Host } from '../../models/Host';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Gets list of hosts
  if (req.method === 'GET') {
    const hosts: Host[] = await Hosts.find(req.query);
    return res.status(200).send({ success: true, hosts: hosts });
    // Adds new host
  } else if (req.method === 'POST') {
    const { hostId, hostName, shortName, refreshToken, spotifyId } = JSON.parse(
      req.body,
    );
    if (!hostName)
      return res.status(400).json({ error: `hostName must be present` });
    if (!shortName)
      return res.status(400).json({ error: `shortName must be present` });
    if (!refreshToken)
      return res.status(400).json({ error: `refreshToken must be present` });
    if (!spotifyId)
      return res.status(400).json({ error: `refreshToken must be present` });
    const host: Host = {
      hostId: hostId,
      hostName: hostName,
      shortName: shortName,
      spotifyRefreshToken: refreshToken,
      spotifyId: spotifyId,
    };
    const findRes = await Hosts.findOne(host);

    if (findRes) {
      return res
        .status(400)
        .json({ success: false, error: `host already exists` });
    }

    const result = await Hosts.create(host).catch(e => {
      console.error('Failed to create host', e);
      return null;
    });
    return res.status(200).json({ success: true, host: result });
  }
};

export default connectDB(handler);
