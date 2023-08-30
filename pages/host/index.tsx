'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SpotifyAuthButton from '../../components/Leaderboard/SpotifyAuthButton';

export default function Login() {
  const { data: session } = useSession();

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const foo = async () => {
      //@ts-ignore
      const accessToken = session.accessToken ?? '';
      // const accessToken = await getAccessToken(session.refreshToken);
      if (!accessToken) console.warn('ACCESS TOKEN MISSING FOR SPOTIFY');
      setAccessToken(accessToken);
    };
    foo();
  }, [session]);

  return (
    <div className="bg-pfm-purple-300 text-white w-screen h-screen p-8">
      <h1 className="text-2xl mb-8">Host Login</h1>
      <SpotifyAuthButton />
      <br />
      <p>accessToken:</p>
      <br />
      <div className="flex">
        <code className="bg-pfm-purple-100 p-4 truncate">
          {' '}
          {/* style={{ backgroundColor: 'black', padding: '.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: "nowrap" }}> */}
          {accessToken}
        </code>
      </div>
    </div>
  );
}
