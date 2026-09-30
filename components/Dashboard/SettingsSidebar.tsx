import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

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

export function SettingsSidebar() {
  const router = useRouter();
  const currentSection = (router.query.section as string) || 'general';

  return (
    <div className="w-full md:w-64 md:shrink-0 md:border-r border-white/10">
      <div className="md:h-full md:px-4 md:py-6">
        <nav
          aria-label="Settings sections"
          className="flex gap-1 overflow-x-auto md:block md:space-y-1"
        >
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
