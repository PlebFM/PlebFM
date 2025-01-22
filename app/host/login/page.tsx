'use client';
import Link from 'next/link';
import SpotifyAuthButton from '../../../components/Leaderboard/SpotifyAuthButton';
import { motion } from 'framer-motion';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';
import HostLoginLayout from '../../../components/Signup/HostLoginLayout';
import { useHostLogin } from '../../../components/hooks/useHostLogin';
import { useRouter } from 'next/navigation';

export default function HostLogin() {
  const { session, isLoading } = useHostLogin();
  const router = useRouter();

  return (
    <HostLoginLayout title="Host Login">
      {/* Step Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-medium text-white">Host Login</h1>
        </div>
        <p className="text-white/60">
          Connect with Spotify to manage your jukebox
        </p>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-lg p-8"
      >
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <MusicalNoteIcon className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-white/60 text-sm">
                Sign in with your Spotify account to access your jukebox
              </p>
            </div>
          </div>

          <SpotifyAuthButton
            session={session}
            isLoading={isLoading}
            onSuccessRedirect="/host/dashboard"
            onContinue={() => {
              router.push('/host/dashboard');
            }}
          />

          <div className="text-center">
            <p className="text-white/40 text-sm">
              Don&apos;t have a jukebox yet?{' '}
              <Link
                href="/host/signup"
                className="text-orange-300 hover:text-orange-200"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </HostLoginLayout>
  );
}
