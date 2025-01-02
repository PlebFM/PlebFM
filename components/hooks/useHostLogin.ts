import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

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

export function useHostLogin() {
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id || isVerified || isLoading) return;

    const verifySpotifyUser = async () => {
      setIsLoading(true);
      try {
        if (!session.user?.id) return;
        const host = await findHost(session.user.id);
        if (host) {
          setIsVerified(true);
        } else {
          await signOut();
        }
      } catch (error) {
        console.error('Error verifying Spotify user:', error);
        await signOut();
      } finally {
        setIsLoading(false);
      }
    };

    verifySpotifyUser();
  }, [isLoading, isVerified, session]);

  return {
    session,
    isVerified,
    isLoading,
  };
}
