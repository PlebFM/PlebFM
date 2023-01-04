import SpotifyAuthButton from './SpotifyAuthButton';
import { WebPlayback } from '../../components/SpotifyPlayback';
import { useState } from 'react';

export default function Login() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <div>
      <h1>Host Login</h1>
      <SpotifyAuthButton />
      {/* <Link href="/api/auth/login">
        Login Button
      </Link> */}

      {accessToken && <WebPlayback token={accessToken} />}
    </div>
  );
}
