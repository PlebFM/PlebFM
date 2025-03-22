import { Metadata } from 'next';
import { ReactNode } from 'react';
import { SignupLayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: 'Create Your Jukebox - PlebFM',
  description: 'Set up your PlebFM jukebox for your venue',
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <SignupLayoutClient>{children}</SignupLayoutClient>;
}
