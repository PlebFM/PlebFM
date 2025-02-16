import React from 'react';
import { SettingsSidebar } from '../../../../../components/Dashboard/SettingsSidebar';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
