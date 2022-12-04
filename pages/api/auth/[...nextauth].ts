import NextAuth, { Session, User } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
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

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
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
    async jwt({token, user, account}) {
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account?.expires_at || 0) * 1000,
          refreshToken: account.refresh_token,
          user,
        }
      }
       // Return previous token if the access token has not expired yet
       if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({session, user}) {
      session.user = user;
      return session;
    },
  },
})