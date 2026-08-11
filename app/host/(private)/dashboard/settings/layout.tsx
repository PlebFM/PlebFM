import type { ReactNode } from 'react';

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
