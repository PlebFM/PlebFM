import { Session } from 'next-auth';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Hosts, { Host } from '../models/Host';
import Button from './Button';

const findHost = async (refreshToken: string) => {
  console.log('FIND HOST', refreshToken);
  const params = new URLSearchParams({ spotifyRefreshToken: refreshToken });
  console.log('Findin the host', `/api/hosts?${params}`);
  const res = await fetch(`/api/hosts?${params}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
    },
  });
  return await res.json();
};
const findOrCreateNewHost = async (
  shortName: string,
  hostName: string,
  refreshToken: string,
): Promise<Host> => {
  const body = { shortName, hostName, refreshToken };
  const res = await fetch(`/api/hosts`, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return await res.json();
};

const SpotifyAuthButton = () => {
  const { data: session } = useSession();
  const [host, setHost] = useState<Host | null>(null);

  useEffect(() => {
    const getHost = async () => {
      if (!session) return;
      // @ts-ignore
      const refreshToken = session.refreshToken;
      if (!refreshToken) signOut();
      const findRes = await findHost(refreshToken);
      if (findRes) {
        setHost(findRes);
        return;
      }
      const res = await findOrCreateNewHost(
        'jordan',
        'jordanBravo',
        refreshToken,
      );
      setHost(res);
    };
    getHost();
  }, [session]);

  if (session) {
    return (
      <div className="flex flex-col space-y-8">
        <p>Signed in as {session?.user?.email ?? 'Spotify User'}</p>

        <Button onClick={() => signOut()}>Sign Out</Button>

        <p>Host Obj:</p>

        <code className="bg-pfm-purple-100 p-4">
          {host ? JSON.stringify(host) : '...'}
        </code>

        <Button href="/host/queue">Go to Leaderboard</Button>
      </div>
    );
  }
  return (
    <>
      <Button onClick={() => signIn('spotify')}>Sign In</Button>
    </>
  );
};

export default SpotifyAuthButton;
