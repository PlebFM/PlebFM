import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const urlencoded = new URLSearchParams();
    urlencoded.append('q', req.query.query as string || '');
    const result = fetch(`https://api.spotify.com/v1/search?q=${req.query.query}&type=track&limit=10`).then(x => {
      x.text()
    }).then(x => {
      // console.log(result);
      res.status(200).json(result);
    }).catch(e => {
      console.error('error', e);
      res.status(500).json(e);
    });

  }
}
