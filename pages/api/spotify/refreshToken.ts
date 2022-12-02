import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'GET') {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ grant_type: 'client_credentials', refreshToken: req.body.refreshToken })
      });

      if (!response.ok) res.status(500).json({error: 'failed to get access token'});
      res.status(200).json(response.json());

    } catch (e) {
      res.status(500).json({error: 'failed to get access token'});
    }
  }
}
