import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  shortName: string;
}

export function MobileMenu({ isOpen, shortName }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden py-2 space-y-1 overflow-hidden"
        >
          <Link
            href="/host/dashboard"
            className="block text-white/90 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/host/queue"
            className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            Queue
          </Link>
          <Link
            href="/host/analytics"
            className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            Analytics
          </Link>
          <Link
            href="/host/settings"
            className="block text-white/70 hover:text-white px-3 py-2 rounded-md text-base font-medium"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
