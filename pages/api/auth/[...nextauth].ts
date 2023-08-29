import NextAuth, { Session, User } from 'next-auth';
import { JWT as NextAuthJWT } from 'next-auth/jwt';

import SpotifyProvider from 'next-auth/providers/spotify';

type GenericObject<T = unknown> = T & {
  [key: string]: any;
};
interface AuthToken {
  user: User;
  accessToken: string;
  accessTokenExpires?: number;
  exp?: number;
  iat?: number;
  expires_at?: number;
  refreshToken: string;
  error?: string;
}
interface JWT extends NextAuthJWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  user?: Session['user'];
}

interface JwtInterface {
  token: JWT;
  user: User;
  account: GenericObject;
}
/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
// async function refreshAccessToken(token: AuthToken): Promise<AuthToken> {
//   try {
//     const clientId = process.env.SPOTIFY_CLIENT_ID;
//     const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
//     const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
//     const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

//     //@ts-ignore
//     const response = await fetch(TOKEN_ENDPOINT, {
//       method: 'POST',
//       headers: {
//         Authorization: `Basic ${basic}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         grant_type: 'client_credentials',
//         //@ts-ignore
//         // refreshToken: token.accessToken,
//         refreshToken: token.refreshToken,
//       }),
//     });

//     const refreshedTokens = await response.json();

//     if (!response.ok) {
//       throw refreshedTokens;
//     }

//     // Give a 10 sec buffer
//     const now = new Date();
//     const accessTokenExpires = now.setSeconds(
//       now.getSeconds() + parseInt(refreshedTokens.expires_in) - 10,
//     );

//     return {
//       ...token,
//       accessToken: refreshedTokens.access_token,
//       accessTokenExpires,
//       refreshToken: token.refreshToken,
//     };
//   } catch (error) {
//     console.log('Refresh AccessToken err', error);

//     return {
//       ...token,
//       error: 'RefreshAccessTokenError',
//     };
//   }
// }
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

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      authorization:
        'https://accounts.spotify.com/authorize?scope=user-read-playback-state,user-modify-playback-state,user-read-playback-position,streaming,user-read-email,user-read-private',
      // checks: ['pkce', 'state'],
    }),
  ],
  callbacks: {
    //@ts-ignore
    async jwt({ token, user, account }: JwtInterface): Promise<JWT> {
      // let res: AuthToken;
      // const now = Math.floor(Date.now() / 1000);

      if (account && user) {
        // res = {
        //   accessToken: account.access_token,
        //   accessTokenExpires: Date.now() + (account?.expires_at || 0) * 1000,
        //   refreshToken: account.refresh_token,
        //   user,
        //   expires_at: Date.now() + (account?.expires_at || 0) * 1000,
        // };
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
        // res = token;
        return token;
      } else {
        const newToken = await refreshAccessToken(token);
        return newToken;
        // res = await refreshAccessToken(token);
      }
      // return res;
    },
    // @ts-ignore
    async session({
      session,
      token,
    }: {
      token: GenericObject;
    }): Promise<GenericObject> {
      // return Promise.resolve(token);
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user = token.user;
      return session;
    },
  },
});
