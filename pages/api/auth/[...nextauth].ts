import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify"

type GenericObject<T = unknown> = T & {
  [key: string]: any 
}
interface AuthToken {
  user: User
  accessToken: string
  accessTokenExpires?: number
  expires_at?: number
  refreshToken: string
  error?: string
}

interface JwtInterface {
  token: AuthToken
  user: User
  account: GenericObject
}
/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: AuthToken): Promise<AuthToken> {
  try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ grant_type: 'client_credentials', refreshToken: req.body.refreshToken })
      });

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    // Give a 10 sec buffer
    const now = new Date()
    const accessTokenExpires = now.setSeconds(
      now.getSeconds() + parseInt(refreshedTokens.expires_in) - 10,
    )

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires,
      refreshToken: token.refreshToken
    };
  } catch (error) {
    console.log('Refresh AccessToken err', error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

const saveNewCustomer = async () => {

}

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization: 'https://accounts.spotify.com/authorize?scope=user-read-playback-state,user-modify-playback-state,user-read-playback-position,streaming',
    }),
  ],
  callbacks: {
    //@ts-ignore
    async jwt({token, user, account}: JwtInterface): Promise<AuthToken> {
      let res: AuthToken;
      const now = Date.now();

      if (account && user) {
        res = {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account?.expires_at || 0) * 1000,
          refreshToken: account.refresh_token,
          user,
        }
      } else if (token.expires_at == null || now < token.expires_at) {
        res = token
      } else {
        res = await refreshAccessToken(token);
      }
      return res;
    },
    // @ts-ignore
    async session({ 
      token 
    }: {
      token: GenericObject
    }): Promise<GenericObject> {
      return Promise.resolve(token);
    },
  },
})