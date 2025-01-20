import querystring from 'querystring';

const defaultTrack = 'spotify:track:3bMc9oRaUWnojCrYTUXXcQ';

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
      Accept: '*/*',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) console.error('get access token failed');

  return await response.json();
};

export const searchTrack = async (
  queryText: string,
  accessToken: string,
  limit?: string,
) => {
  const queries = querystring.stringify({
    q: queryText,
    type: 'track',
    limit: limit,
  });
  const searchUrl = `https://api.spotify.com/v1/search?${queries}`;
  // const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const res = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  const result = await res.json();
  return result.tracks;
};
const getCurrentTrack = async (accessToken: string) => {
  const url = `https://api.spotify.com/v1/me/player/currently-playing`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  console.log('res (Track) -state', res.status);
  if (res.status === 204) return null;
  const result = await res.json();
  return result;
};

export const getPlaybackState = async (accessToken: string) => {
  // try {
  const url = `https://api.spotify.com/v1/me/player`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  console.log('res -state', res.status);
  if (res.status === 204) {
    const trackRes = await getCurrentTrack(accessToken);
    console.log('trackRes', trackRes);
    return trackRes;
    // return null;
  }
  const result = await res.json();
  return result;
};

export const getTrack = async (trackId: string, accessToken: string) => {
  const searchUrl = `https://api.spotify.com/v1/tracks/${trackId}`;
  const res = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  const result = await res.json();
  return result;
};

export const transferPlayback = async (
  deviceId: string,
  accessToken: string,
) => {
  const playbackState = await getPlaybackState(accessToken);

  const searchUrl = `https://api.spotify.com/v1/me/player`;
  const body = JSON.stringify({ device_ids: [deviceId], play: true });
  const res = await fetch(searchUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: body,
  });
  if (res.status !== 204) return { success: false };

  // If the current track is already playing, stop early
  if (playbackState?.is_playing) return { success: true };

  // Otherwise, start a default track
  const playUrl = `https://api.spotify.com/v1/me/player/play`;
  const playBody = JSON.stringify({
    device_id: deviceId,
    uris: [defaultTrack],
  });
  const playRes = await fetch(playUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: playBody,
  });
  if (playRes.status !== 202) return { success: false };
  return { success: true };
};

// Resets spotify queue by playing a song
export const startSpotifyQueue = async (
  trackUri: string,
  deviceId: string,
  accessToken: string,
) => {
  const url = `https://api.spotify.com/v1/me/player/play`;
  const body = JSON.stringify({ urs: [trackUri], device_id: deviceId });
  const result = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body,
  });
  return result;
};

const skipSong = async (deviceId: string, accessToken: string) => {
  const url = `https://api.spotify.com/v1/me/player/next`;
  const body = JSON.stringify({ device_id: deviceId });
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: body,
  });
  return result;
};
export const clearSpotifyQueue = async (
  deviceId: string,
  accessToken: string,
  // _spotifyQueue?: { queue: any[]; error: any; currently_playing: any },
) => {
  const _spotifyQueue = await getSpotifyQueue(accessToken);
  const spotifyQueue = _spotifyQueue?.queue;
  console.log('oldqueue', spotifyQueue);
  const current = _spotifyQueue?.currently_playing;
  console.log('current', current.name);
  if (!spotifyQueue)
    throw new Error(
      `No spotify queue found! ${JSON.stringify(_spotifyQueue?.error)}`,
    );
  const trackUri = `spotify:track:${_spotifyQueue?.currently_playing?.id}`;
  // await addTrackToSpotifyQueue(trackUri, deviceId, accessToken);
  // const newSpotifyQueue = await getSpotifyQueue(accessToken);
  // console.log('new queue', newSpotifyQueue.queue)
};

export const addTrackToSpotifyQueue = async (
  trackUri: string,
  deviceId: string,
  accessToken: string,
) => {
  const queries = querystring.stringify({
    uri: trackUri,
    device_id: deviceId,
  });
  const url = `https://api.spotify.com/v1/me/player/queue?${queries}`;
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  console.log('add track result', result.statusText, result.status);
  return result;
};

export const getSpotifyQueue = async (accessToken: string) => {
  const spotifyQueueEndpoint = 'https://api.spotify.com/v1/me/player/queue';

  const res = await fetch(spotifyQueueEndpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  if (!res.ok) {
    console.error('Spotify error', res.statusText);
  }
  const result = await res.json();
  return result;
};

const spotifyRecentlyPlayedEndpoint =
  'https://api.spotify.com/v1/me/player/recently-played';
export const getSpotifyRecentlyPlayed = async (
  accessToken: string,
  limit: number = 10,
) => {
  const res = await fetch(`${spotifyRecentlyPlayedEndpoint}?limit=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  const result = await res.json();
  return result;
};

export const getPlaylist = async (playlistId: string, accessToken: string) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch playlist');
  }
  return res.json();
};

export const createPlaylist = async (
  userId: string,
  name: string,
  description: string,
  isPublic: boolean,
  accessToken: string,
) => {
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
    }),
  });
  if (!res.ok) {
    console.error('Failed to create playlist', res.statusText);
    throw new Error(`Failed to create playlist: ${res.statusText}`);
  }
  return res.json();
};

export const addTracksToPlaylist = async (
  playlistId: string,
  trackUris: string[],
  accessToken: string,
) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: JSON.stringify({
      uris: trackUris,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to add tracks to playlist');
  }
  return res.json();
};

export const setPlaylistCoverImage = async (
  playlistId: string,
  base64Image: string,
  accessToken: string,
) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/images`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'image/jpeg',
    },
    body: base64Image,
  });
  if (!res.ok) {
    throw new Error('Failed to set playlist cover image');
  }
  return res.ok;
};
