'use client';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import { getSession, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WebPlayback } from '../../components/SpotifyPlayback';
import {
  addTrackToSpotifyQueue,
  getAccessToken,
  getPlaybackState,
  searchTrack,
} from '../../lib/spotify';
import SpotifyAuthButton from '../../components/SpotifyAuthButton';

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   if (context.req.cookies["spotify-token"]) {
//     const token: string = context.req.cookies["spotify-token"];
//     return {
//       props: { token: token },
//     };
//   } else {
//     return {
//       props: { token: "" },
//     };
//   }
// };

export default function Login() {
  const { data: session } = useSession();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const cbat = '0AzD1FEuvkXP1verWfaZdv';

  useEffect(() => {
    if (!session) return;
    const foo = async () => {
      const accessToken = session.accessToken ?? '';
      // const accessToken = await getAccessToken(session.refreshToken);
      if (!accessToken) console.warn('ACCESS TOKEN MISSING FOR SPOTIFY');
      setAccessToken(accessToken);
      // const playRes = await getPlaybackState(accessToken);

      // await searchTrack('cbat', accessToken, '1').then((x) => {
      //     console.log(x);
      // });
      // await addTrackToSpotifyQueue('spotify:track:0AzD1FEuvkXP1verWfaZdv', "39e3ac37c47e025896e18e37a168bc8a9dce7149", accessToken).then((res) => console.log(res));
    };
    foo();
  }, [session]);

  return (
    <div>
      <h1>Host Login</h1>
      <SpotifyAuthButton />

      {accessToken && <WebPlayback token={accessToken} />}
    </div>
  );
}
