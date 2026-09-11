import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '../lib/spotify';
import Hosts from '../models/Host';
import { ensureDB } from '../lib/db';
import { HttpError, sendError } from '../lib/http';
const withJukebox =
  (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const shortName =
        req.method === 'GET' ? req.query.shortName : req.body?.shortName;
      if (typeof shortName !== 'string' || !shortName)
        throw new HttpError(400, 'A jukebox URL is required');
      await ensureDB();
      const host = await Hosts.findOne({ shortName, deletedAt: null });
      if (!host) throw new HttpError(404, 'Jukebox not found');
      const token = await getAccessToken();
      req.headers.accessToken = token.access_token;
      return await handler(req, res);
    } catch (error) {
      return sendError(res, error);
    }
  };
export default withJukebox;
