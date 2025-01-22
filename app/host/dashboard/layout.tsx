import React from 'react';
import { SectionHeader } from '../../ui/SectionHeader';

export default async function HostLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <>
      <SectionHeader pathname="/host/dashboard" />
      {children}
    </>
  );
}
