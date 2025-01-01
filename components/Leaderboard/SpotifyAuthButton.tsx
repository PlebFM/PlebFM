import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface SpotifyAuthButtonProps {
  onSuccess?: () => void;
}

const findHost = async (spotifyId: string) => {
  const res = await fetch(`/api/hosts?spotifyId=${spotifyId}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
    },
  });
  const resJson = await res.json();
  return resJson.hosts[0];
};

const SpotifyAuthButton = ({ onSuccess }: SpotifyAuthButtonProps) => {
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id || isVerified || isLoading) return;

    const verifySpotifyUser = async () => {
      setIsLoading(true);
      try {
        if (!session.user?.id) return;
        const host = await findHost(session.user.id);
        if (host) {
          setIsVerified(true);
        } else {
          await signOut();
        }
      } catch (error) {
        console.error('Error verifying Spotify user:', error);
        await signOut();
      } finally {
        setIsLoading(false);
      }
    };

    verifySpotifyUser();
  }, [isLoading, isVerified, session]);

  if (session) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 text-white/80"
        >
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
              />
            </svg>
          </div>
          <span>Connected as {session?.user?.email ?? 'Spotify User'}</span>
        </motion.div>

        <AnimatePresence>
          {isVerified && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSuccess?.()}
                className="flex items-center justify-center space-x-2 bg-orange-300/90 hover:bg-orange-300 text-black font-medium px-8 py-3 rounded-lg transition-colors"
              >
                <span>Continue</span>
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut()}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
        >
          Disconnect
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => signIn('spotify')}
      className="w-full flex items-center justify-center space-x-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium px-8 py-3 rounded-lg transition-colors"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
        />
      </svg>
      <span>Connect with Spotify</span>
    </motion.button>
  );
};

export default SpotifyAuthButton;
