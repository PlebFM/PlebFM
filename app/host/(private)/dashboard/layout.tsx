import React from 'react';
import { SectionHeader } from '../../../ui/SectionHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <>
      <SectionHeader />
      {children}
    </>
  );
}
