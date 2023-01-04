'use client';
import AuthContext from './AuthContext';
import SpotifyAuthButton from './SpotifyAuthButton';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <>
    <AuthContext>
      <SpotifyAuthButton />
      {children}
    </AuthContext>
  </>;
}
