import { Host } from '../models/Host';

export const findHost = async (spotifyId: string): Promise<Host> => {
  const res = await fetch(`/api/hosts?spotifyId=${spotifyId}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
    },
  });
  const resJson = await res.json();
  return resJson?.hosts[0];
};

export const syncJukebox = async (
  accessToken: string,
  shortName: string,
  deviceId: string,
) => {
  let url = `/api/leaderboard/queue`;
  const body = JSON.stringify({
    shortName: shortName,
    accessToken: accessToken,
    deviceId: deviceId,
  });
  const response = await fetch(url, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  const res = await response.json();
  return res;
};
