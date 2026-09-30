import { HttpError } from './http';
let catalog: { access_token: string; expires: number } | undefined;
export async function getAccessToken(refreshToken?: string) {
  if (!refreshToken && catalog && catalog.expires > Date.now()) return catalog;
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      refreshToken
        ? { grant_type: 'refresh_token', refresh_token: refreshToken }
        : { grant_type: 'client_credentials' },
    ),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new HttpError(
      503,
      'Spotify connection needs attention. Please reconnect.',
    );
  const data = await response.json();
  if (!data.access_token)
    throw new HttpError(503, 'Spotify returned no access token');
  if (!refreshToken)
    catalog = {
      access_token: data.access_token,
      expires: Date.now() + Math.max(0, data.expires_in - 60) * 1000,
    };
  return data;
}
async function spotify(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown,
) {
  if (!token) throw new HttpError(401, 'Reconnect Spotify to control playback');
  const response = await fetch(`https://api.spotify.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new HttpError(
      response.status === 401 ? 401 : 502,
      response.status === 401
        ? 'Reconnect Spotify to continue'
        : `Spotify request failed (${response.status})`,
    );
  if (response.status === 204 || response.headers.get('content-length') === '0')
    return null;
  return response.json();
}
export const searchTrack = async (query: string, token: string, limit = '10') =>
  (
    await spotify(
      `search?${new URLSearchParams({
        q: query,
        type: 'track',
        limit: String(Math.min(50, Math.max(1, Number(limit) || 10))),
      })}`,
      token,
    )
  ).tracks;
export const getTrack = (id: string, token: string) =>
  spotify(`tracks/${encodeURIComponent(id)}`, token);
export const getPlaybackState = (token: string) => spotify('me/player', token);
export const getSpotifyQueue = (token: string) =>
  spotify('me/player/queue', token);
export const getSpotifyRecentlyPlayed = (token: string, limit = 10) =>
  spotify(
    `me/player/recently-played?limit=${Math.min(50, Math.max(1, limit))}`,
    token,
  );
export const transferPlayback = async (deviceId: string, token: string) => {
  await spotify('me/player', token, 'PUT', {
    device_ids: [deviceId],
    play: true,
  });
  return { success: true };
};
export const startSpotifyQueue = async (
  trackUri: string,
  deviceId: string,
  token: string,
) => {
  await spotify(
    `me/player/play?${new URLSearchParams({ device_id: deviceId })}`,
    token,
    'PUT',
    { uris: [trackUri] },
  );
  return { success: true };
};
export const skipSong = async (token: string, deviceId?: string) => {
  await spotify(
    `me/player/next${
      deviceId ? '?' + new URLSearchParams({ device_id: deviceId }) : ''
    }`,
    token,
    'POST',
  );
  return { success: true };
};
export const addTrackToSpotifyQueue = async (
  trackUri: string,
  deviceId: string,
  token: string,
) => {
  await spotify(
    `me/player/queue?${new URLSearchParams({
      uri: trackUri,
      ...(deviceId ? { device_id: deviceId } : {}),
    })}`,
    token,
    'POST',
  );
  return { success: true };
};
// Spotify has no API to delete its playback queue. Clearing PlebFM's queue is handled separately.
