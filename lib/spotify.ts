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

export const getPlaybackState = async (accessToken: string) => {
  try {
    const searchUrl = `https://api.spotify.com/v1/me/player`;
    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });
    if (!res.ok) return null;
    const result = await res.json();
    const response = {
      deviceName: result.device.name,
      deviceId: result.device.id,
      repeatState: result.repeat_state,
      shuffleState: result.shuffle_state,
      trackUri: result.item.id,
      progressMs: result.progress_ms,
      durationMs: result.item.duration_ms,
    };
    return response;
  } catch (e) {
    console.error(e);
    return null;
  }
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
  console.log(result);
  return result;
};

export const transferPlayback = async (
  deviceId: string,
  accessToken: string,
) => {
  const searchUrl = `https://api.spotify.com/v1/me/player`;
  const body = JSON.stringify({ device_ids: [deviceId], play: true });
  console.log('body', body);
  const res = await fetch(searchUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: body,
  });
  console.log(res);
  if (res.status === 202) return { success: true };
  else return { success: false };
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
  const searchUrl = `https://api.spotify.com/v1/me/player/queue?${queries}`;
  const result = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  return result;
};

const tempToken =
  'BQAuRHI33rvZ464_0IYLNkDYd4LIpM67o8_3yZq0lp5b-hTDKR8wZyqkqFixmrnRt1Y9WtdsLlQNCe2m73C2ZlNt577lUx6I4W49UkVeTm67I-Qecbpef7JQuKFr3w-NaPFCl75MTI4VM_9qz7WmwlW1jtu2ecB-f7DVH5Ec8h5CxvfNx34_6TQeleCBhnBZYqIfmMILZvzJhiqS2jf0xRwKEkjVRlDHuQ';
const spotifyQueueEndpoint = 'https://api.spotify.com/v1/me/player/queue';
export const getSpotifyQueue = async (accessToken: string = tempToken) => {
  const res = await fetch(spotifyQueueEndpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  const result = await res.json();
  console.log('result: ', result);
  return result;
};

/* 
    above function returns this object:
    {
        currently_playing: null,
        queue: []
    }
*/

const addItemToSpotifyQueue = async (songId: string, deviceId: string) => {
  const response = await fetch(spotifyQueueEndpoint, {
    method: 'POST',
    // header: {
    //     Authorization: '',
    //     Content-Type: 'application/json'
    // },
    // body: {
    //     songId: '',
    //     deviceId: ''
    // }
  });
};

export const queueNextSongInSpotify = async (
  accessToken: string,
  customerId: string,
) => {
  const spotifyQueueResult: any = getSpotifyQueue();
  const nextSpotifySong = spotifyQueueResult.queue[0].id;
  // call route with customerId=customerId and next=true
  const apiUrl = '/api/leaderboard/queue?customerId=customerId&next=true';
  const dbResponse = await fetch(apiUrl);
  const dbQueueResult = await dbResponse.json();
  // returns list of objects (instances), element 0 will have status: next
  const nextDbSong = dbQueueResult[0].songId;
  if (nextDbSong !== nextSpotifySong) {
    //    add nextDbSong to spotify queue
  }
  console.log('nextSpotifySong: ', nextSpotifySong);
  // check spotify queue against database queue
  // then reconcile spotify queue
  // if (queue[0].songId !== nextSong.songId) {
  //     // erase queue
  //     queue.push(dbInstance[0]);
  // }
};
