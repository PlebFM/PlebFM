import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Host } from '../models/Host';
import Button from './Button';

const findHost = async (spotifyId: string) => {
  const res = await fetch(`/api/hosts?spotifyId=${spotifyId}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
    },
  });
  const resJson = await res.json();
  return resJson.hosts[0];
};
const updateHost = async (shortName: string, refreshToken: string) => {
  const res = await fetch(`/api/hosts`, {
    method: 'PATCH',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ shortName, refreshToken }),
  });
};

const SpotifyAuthButton = () => {
  const { data: session } = useSession();
  const [host, setHost] = useState<Host | null>(null);

  useEffect(() => {
    if (!session || !session.user) return;
    // @ts-ignore
    const spotifyId = session.user.id;
    if (!spotifyId) signOut();
    findHost(spotifyId).then(async host => {
      if (host) {
        setHost(host);
        // @ts-ignore
        const refreshToken = session.refreshToken;
        if (refreshToken !== host?.spotifyRefreshToken) {
          await updateHost(host.shortName, refreshToken);
        }
      }
    });
  }, [session]);

  if (session) {
    return (
      <div className="flex flex-col space-y-8">
        <p>Signed in as {session?.user?.email ?? 'Spotify User'}</p>
        <Button onClick={() => signOut()}>Sign Out</Button>
        <p>Host</p>
        <code className="bg-pfm-purple-100 p-4 truncate">
          {host ? host.shortName : '...'}
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
