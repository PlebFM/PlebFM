import querystring from 'querystring';

export const getAccessToken = async (refreshToken: string) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': "*/*"
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) console.error('get access token failed');

  return await response.json();
};

export const searchTrack = async (queryText: string, accessToken: string, limit?: string) => {
  const queries = querystring.stringify({
    q: queryText,
    type: 'track',
    limit: limit
  });
  const searchUrl = `https://api.spotify.com/v1/search?${queries}`;
  // const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const res = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    },
  });
  const result = await res.json();
  return result.tracks;
};

export const getTrack = async (trackId: string, accessToken: string) => {
  const searchUrl = `https://api.spotify.com/v1/tracks/${trackId}`;
  const res = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    },
  });
  const result = await res.json();
  console.error(result);
  return result;

}