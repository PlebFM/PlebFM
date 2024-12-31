import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt/types';

import SpotifyProvider from 'next-auth/providers/spotify';
import connectDB from '../../../middleware/mongodb';
import Hosts from '../../../models/Host';

type GenericObject<T = unknown> = T & {
  [key: string]: any;
};
/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    });
    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body as BodyInit,
    });
    const data = await res.json();
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

const createHost = async (spotifyId: string, refreshToken: string) => {
  const host = await Hosts.findOneAndUpdate(
    { spotifyId },
    { spotifyRefreshToken: refreshToken, spotifyId },
    { new: true, upsert: true },
  );
  return host;
};

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      authorization:
        'https://accounts.spotify.com/authorize?scope=user-read-playback-state,user-modify-playback-state,user-read-playback-position,streaming,user-read-email,user-read-private,user-read-recently-played',
    }),
  ],
  callbacks: {
    //@ts-ignore
    jwt: connectDB(async ({ token, user, account }): Promise<JWT> => {
      if (account && user) {
        await createHost(user.id, account.refresh_token);
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          user,
        };
      } else if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      } else {
        const newToken = await refreshAccessToken(token);
        return newToken;
      }
      // return res;
    }),
    // @ts-ignore
    async session({
      session,
      token,
    }: {
      token: GenericObject;
      session: Session;
    }): Promise<GenericObject> {
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.error = token.error;
      session.user = token.user;
      return session;
    },
  },
};

export default NextAuth(authOptions);
