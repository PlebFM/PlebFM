import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'General', href: '/host/settings' },
  { name: 'Billing', href: '/host/settings/billing' },
  { name: 'Integrations', href: '/host/settings/integrations' },
  { name: 'Security', href: '/host/settings/security' },
  { name: 'Appearance', href: '/host/settings/appearance' },
];

interface SettingsSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SettingsSidebar({ isOpen, setIsOpen }: SettingsSidebarProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed bottom-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full shadow-lg text-white hover:bg-white/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 bottom-0 w-72 bg-black border-r border-white/10 md:translate-x-0 md:static md:w-60 flex-shrink-0 transition-transform duration-200 ease-in-out z-50`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="sticky top-8">
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full bg-white/5 border-0 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Search..."
                />
              </div>
            </div>

            <div className="space-y-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    currentPath === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
