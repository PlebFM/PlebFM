'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  CreditCardIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

type SettingsSidebarProps = {
  section: string;
};

const navigationItems = [
  {
    name: 'General',
    href: '/host/dashboard/settings?section=general',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Appearance',
    href: '/host/dashboard/settings?section=appearance',
    icon: PaintBrushIcon,
  },
  {
    name: 'Billing',
    href: '/host/dashboard/settings?section=billing',
    icon: CreditCardIcon,
  },
];

export function SettingsSidebar({ section }: SettingsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[99] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-[100] w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="h-full px-4 py-6">
          <div className="mb-8 md:hidden">
            <Image
              src="/plebfm-logo-bold.svg"
              alt="PlebFM"
              width={160}
              height={35}
              className="mx-auto"
              priority
            />
          </div>
          <nav className="space-y-1">
            {navigationItems.map(item => {
              const isActive = section === item.href.split('section=')[1];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={`${
                      isActive
                        ? 'text-white'
                        : 'text-white/60 group-hover:text-white'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[101] p-4 bg-white/10 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors md:hidden"
        aria-label="Toggle Settings Menu"
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>
    </>
  );
}
