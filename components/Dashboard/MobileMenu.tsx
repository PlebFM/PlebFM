import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface MobileMenuProps {
  isOpen: boolean;
  shortName: string;
  setMobileMenuOpen: (open: boolean) => void;
}

export function MobileMenu({
  isOpen,
  shortName,
  setMobileMenuOpen,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentPath = router.pathname;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Ignore clicks on the menu itself and the header
      if (menuRef.current?.contains(target) || target.closest('header')) {
        return;
      }
      setMobileMenuOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setMobileMenuOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed top-16 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-white/10 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link
              href="/host/dashboard"
              className={`block ${
                currentPath === '/host/dashboard'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              } px-3 py-2 rounded-md text-base font-medium`}
            >
              Dashboard
            </Link>
            <Link
              href="/host/queue"
              className={`block ${
                currentPath === '/host/queue'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              } px-3 py-2 rounded-md text-base font-medium`}
            >
              Queue
            </Link>
            <Link
              href="/host/analytics"
              className={`block ${
                currentPath === '/host/analytics'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              } px-3 py-2 rounded-md text-base font-medium`}
            >
              Analytics
            </Link>
            <Link
              href="/host/settings"
              className={`block ${
                currentPath === '/host/settings'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              } px-3 py-2 rounded-md text-base font-medium`}
            >
              Settings
            </Link>
            <Link
              href={`/${shortName}`}
              className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              target="_blank"
            >
              View Public Page
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block w-full text-left text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
