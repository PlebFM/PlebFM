'use client';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

type SectionHeaderProps = {
  hide?: boolean;
  pathname: string;
};

export function SectionHeader({ hide }: SectionHeaderProps) {
  const segments = useSelectedLayoutSegments();
  const pathname = segments ? segments.join('/') : '';
  console.log(pathname, segments);

  return (
    <>
      {!hide && (
        <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 flex overflow-x-auto hide-scrollbar">
              <div className="flex space-x-1">
                <Link
                  href="/host/dashboard"
                  className={`${
                    pathname === ''
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/70 hover:text-white hover:border-b-2 hover:border-white/50'
                  } px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/host/dashboard/analytics"
                  className={`${
                    pathname === 'analytics'
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/70 hover:text-white hover:border-b-2 hover:border-white/50'
                  } px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
                >
                  Analytics
                </Link>
                <Link
                  href="/host/dashboard/settings"
                  className={`${
                    pathname === 'settings'
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/70 hover:text-white hover:border-b-2 hover:border-white/50'
                  } px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
