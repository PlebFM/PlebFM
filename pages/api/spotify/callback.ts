import { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query && req.query.code) {
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      `Basic ${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    );
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('code', req.query.code as string);
    urlencoded.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI || '');
    urlencoded.append('grant_type', 'authorization_code');

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    fetch('https://accounts.spotify.com/api/token', requestOptions)
      .then(response => response.text())
      .then(result => {
        const json = JSON.parse(result);
        res.redirect(
          '/?' +
            querystring.stringify({
              auth_result: result,
            }),
        );
      })
      .catch(error => {
        console.log('error', error);
        res.status(500).json(error);
      });
  } else {
    res.status(400).json('Missing required `code` param.');
  }
}
