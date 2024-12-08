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
