import { Session } from 'next-auth';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';
import SpotifyAuthButton from '../Leaderboard/SpotifyAuthButton';

interface SpotifyStepProps {
  session: Session | null;
  isLoading: boolean;
  isVerified: boolean;
  onContinue: () => void;
}

export default function SpotifyStep({
  session,
  isLoading,
  isVerified,
  onContinue,
}: SpotifyStepProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
          <MusicalNoteIcon className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white mb-2">
            Connect Your Spotify Premium Account
          </h2>
          <p className="text-white/60 text-sm">
            PlebFM uses Spotify to play music at your venue. You&apos;ll need a
            Premium account to control playback.
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="min-w-8 mt-1">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white/80">1</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-1">
              Premium Account Required
            </h3>
            <p className="text-white/60 text-sm">
              Make sure you&apos;re using a Spotify Premium account to enable
              playback control.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="min-w-8 mt-1">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white/80">2</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-1">
              Grant Permissions
            </h3>
            <p className="text-white/60 text-sm">
              You&apos;ll need to allow PlebFM to control playback and manage
              your queue.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <SpotifyAuthButton
          session={session}
          isLoading={isLoading}
          onContinue={onContinue}
          onSuccessRedirect={isVerified ? '/host/dashboard' : undefined}
        />
      </div>
    </div>
  );
}
