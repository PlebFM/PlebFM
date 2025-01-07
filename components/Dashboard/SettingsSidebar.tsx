import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface SettingsSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navigationItems = [
  {
    name: 'General',
    href: '/host/settings?section=general',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Appearance',
    href: '/host/settings?section=appearance',
    icon: PaintBrushIcon,
  },
  {
    name: 'Billing',
    href: '/host/settings?section=billing',
    icon: CreditCardIcon,
  },
];

export function SettingsSidebar({ isOpen, setIsOpen }: SettingsSidebarProps) {
  const router = useRouter();
  const currentSection = (router.query.section as string) || 'general';

  return (
    <div
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-30 w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
    >
      <div className="h-full px-4 py-6">
        <nav className="space-y-1">
          {navigationItems.map(item => {
            const isActive = currentSection === item.href.split('section=')[1];
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
  );
}
