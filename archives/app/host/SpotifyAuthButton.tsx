'use client';

import { Session } from 'next-auth';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Hosts, { Host } from '../../models/Host';

const findHost = async (refreshToken: string) => {
  const params = new URLSearchParams({ spotifyRefreshToken: refreshToken });
  const res = await fetch(`${process.env.BASE_URL}/api/hosts?${params}`, {
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
  const res = await fetch(`${process.env.BASE_URL}/api/hosts`, {
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
      <>
        <p>Signed in as {session?.user?.email ?? 'Spotify User'}</p> <br />
        <button onClick={() => signOut()}>Sign out</button>
        <p>Host Obj: {host ? JSON.stringify(host) : '...'}</p> <br />
      </>
    );
  }
  return (
    <>
      <p>Not signed in</p>
      <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
};

export default SpotifyAuthButton;
