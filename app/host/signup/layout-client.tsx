'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function SignupLayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <SessionProvider>
        <main>{children}</main>
      </SessionProvider>
    </div>
  );
}
