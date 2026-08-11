import type { ReactNode } from 'react';
import { SectionHeader } from '../../../ui/SectionHeader';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SectionHeader />
      {children}
    </>
  );
}
