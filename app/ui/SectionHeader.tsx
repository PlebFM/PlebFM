'use client';

import Link from 'next/link';
import { memo, useEffect } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';

type SectionHeaderProps = {
  hide?: boolean;
};

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

// Optimize individual NavLink to prevent unnecessary re-renders
const NavLink = memo(function NavLink({
  href,
  isActive,
  children,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`${
        isActive
          ? 'text-white border-b-2 border-white'
          : 'text-white/70 hover:text-white hover:border-b-2 hover:border-white/50'
      } px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
    >
      {children}
    </Link>
  );
});

export const SectionHeader = memo(function SectionHeader({
  hide,
}: SectionHeaderProps) {
  const segments = useSelectedLayoutSegments();
  const pathname = segments ? segments.join('/') : '';

  // Preload critical routes when header is rendered
  useEffect(() => {
    const preloadLinks = [
      '/host/dashboard',
      '/host/dashboard/analytics',
      '/host/dashboard/settings',
    ];

    preloadLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  if (hide) return null;

  return (
    <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 flex overflow-x-auto hide-scrollbar">
          <div className="flex space-x-1">
            <NavLink href="/host/dashboard" isActive={pathname === ''}>
              Dashboard
            </NavLink>
            <NavLink
              href="/host/dashboard/analytics"
              isActive={pathname === 'analytics'}
            >
              Analytics
            </NavLink>
            <NavLink
              href="/host/dashboard/settings"
              isActive={pathname === 'settings'}
            >
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
});
