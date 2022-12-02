import querystring from 'querystring';
import { createContext, useContext } from 'react';

export class SpotifyStore {
  initialized: boolean;
  accessToken: string | undefined;
  refreshToken: string | undefined;


  constructor() { 
    this.initialized = false;
  };


  // try to initialize from storage... if it fails, redirect to spotify account service
  async initialize() {
    this.refreshToken = await this.getStorage('spotify_refresh_token');
    // const accessToken = await this.getAccessToken();
    // sessionStorage.setItem('spotify_access_token', accessToken);
    // console.log(accessToken);

    this.initialized = true;
  };

  private async getStorage(itemName: string): Promise<string> {
    const itemValue = sessionStorage.getItem(itemName);
    if (!itemValue) throw Error(`could not retrieve ${itemName} from session storage`);
    return itemValue;
  }

  // Stores result from Spotify Oauth in sessionStorage
  // --> spotify_access_token, spotify_refresh_token, spotify_token_expiry
  private async storeAuth(authResults: string) {
    const json = JSON.parse(authResults)
    sessionStorage.setItem('spotify_access_token', json.access_token);
    sessionStorage.setItem('spotify_refresh_token', json.refresh_token);
    const time = new Date();
    const expiry = new Date((time.getTime() / 1000 + json.expires_in) * 1000);
    sessionStorage.setItem('spotify_token_expiry', expiry.getTime().toString());
  }

  // // Gets Access Token
  // async getAccessToken() {
  //   const refreshToken = sessionStorage.getItem('spotify_refresh_token');
  //   if (refreshToken === null) throw Error('Spotify refresh token is missing.')
  //   const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  //   const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

  //   const response = await fetch(TOKEN_ENDPOINT, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Basic ${basic}`,
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     body: new URLSearchParams({ grant_type: 'client_credentials', refreshToken })
  //   });

  //   if (!response.ok) throw Error('Failed to get spotify access token.')

  //   return response.json();
  // };

  async refreshStatus() {
    // Check for outdated token
    const tokenExpiry = sessionStorage.getItem('spotify_token_expiry');
    if (!tokenExpiry || parseInt(tokenExpiry) > new Date().getTime() ) {
      // const accessToken = await this.getAccessToken();
      // console.log('accessToken', accessToken);
      // sessionStorage.setItem('spotify_access_token', accessToken.access_token);
    }
    throw Error('tokenExpiry is missing');
    // TODO: Double check this
  }


  // Handles spotify search
  async search(querystring: string) {
    // Do search
    
    const res = '[song, song]';

    return {success: true, songs: JSON.parse(res)};
  };

}
export const SpotifyStoreContext = createContext<SpotifyStore>(new SpotifyStore());
export const useSpotify = () => useContext(SpotifyStoreContext);