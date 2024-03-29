import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '../lib/spotify';
import Hosts, { Host } from '../models/Host';

// Finds customer with short name and adds appropriate refresh token to request headers
const withJukebox =
  (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    let shortName;
    if (req.method === 'GET') {
      shortName = req.query?.shortName ?? '';
    } else if (
      req.method === 'POST' ||
      req.method === 'DELETE' ||
      req.method === 'PUT'
    ) {
      shortName = req?.body?.shortName ?? req?.body?.host ?? '';
    }
    if (!shortName) {
      return res
        .status(400)
        .json('withJukebox - Bad request: requires shortName in body or query');
    }
    const customer: Host | null = await Hosts.findOne({
      filter: { shortName: shortName },
    });
    if (!customer)
      return res
        .status(400)
        .send(
          `withJukebox - Bad request: Jukebox with name "${shortName}" not found`,
        );
    const refreshToken = customer.spotifyRefreshToken;

    const accessToken = await getAccessToken(refreshToken);
    if (!accessToken)
      return res.status(400).send(`withJukebox - could not fetch accessToken`);

    req.headers.accessToken = accessToken.access_token;
    return handler(req, res);
  };

export default withJukebox;
