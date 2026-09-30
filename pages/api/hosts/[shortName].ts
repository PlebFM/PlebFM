import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Hosts from '../../../models/Host';
import { publicHost, PUBLIC_HOST_FIELDS } from '../../../lib/public-host';
import { methodNotAllowed } from '../../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (typeof req.query.shortName !== 'string')
    return res.status(400).json({ error: 'Invalid jukebox URL' });
  const host = await Hosts.findOne({
    shortName: req.query.shortName,
    deletedAt: null,
  })
    .select(PUBLIC_HOST_FIELDS)
    .lean();
  if (!host)
    return res.status(404).json({ success: false, error: 'Jukebox not found' });
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ success: true, host: publicHost(host) });
});
