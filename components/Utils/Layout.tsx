import { Metadata } from 'next';
import Head from 'next/head';
import React, { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export default function Layout(props: LayoutProps) {
  return (
    <>
      <main className="m-auto fixed-w bg-gradient-to-b from-pfm-purple-400 to-pfm-purple-100">
        {props.children}
      </main>
    </>
  );
}

export const metadata: Metadata = {
  title: 'PlebFM',
  description: 'PlebFM',
};
