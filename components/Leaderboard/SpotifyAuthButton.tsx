import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import Button from '../Utils/Button';

interface SpotifyAuthButtonProps {
  onSuccess?: () => void;
}

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

const SpotifyAuthButton = ({ onSuccess }: SpotifyAuthButtonProps) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session || !session.user) return;

    const spotifyId = session.user.id;
    if (!spotifyId) signOut();

    findHost(spotifyId).then(async host => {
      if (!host) signOut();
      else onSuccess?.();
    });
  }, [session, onSuccess]);

  if (session) {
    return (
      <div className="flex flex-col space-y-8">
        <p className="text-white/80">
          Signed in as {session?.user?.id ?? 'Spotify User'}
        </p>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>
    );
  }
  return (
    <>
      <Button onClick={() => signIn('spotify')}>Connect Spotify</Button>
    </>
  );
};

export default SpotifyAuthButton;
