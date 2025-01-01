import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SpotifyAuthButton from '../../components/Leaderboard/SpotifyAuthButton';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { MusicalNoteIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

type OnboardingStep = 'spotify' | 'details' | 'complete';

interface JukeboxDetails {
  hostName: string;
  shortName: string;
}

const steps = [
  {
    id: 'spotify',
    title: 'Connect Spotify',
    description: 'Link your Spotify account to control music',
  },
  {
    id: 'details',
    title: 'Jukebox Details',
    description: 'Set up your venue information',
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your jukebox is ready to go',
  },
];

export default function HostSignup() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('spotify');
  const [details, setDetails] = useState<JukeboxDetails>({
    hostName: '',
    shortName: '',
  });
  const router = useRouter();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepInfo = steps[currentStepIndex];

  const handleBack = () => {
    if (currentStep === 'details') {
      signOut();
    } else if (currentStep === 'complete') {
      setCurrentStep('details');
    }
  };

  useEffect(() => {
    if (!session || !session.user) return;
    // @ts-ignore
    const spotifyId = session.user.id;
    if (!spotifyId) signOut();
  }, [session]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // @ts-ignore
      if (!session?.user?.id) {
        console.error('Invalid Spotify session', session);
        throw new Error('Invalid Spotify session');
      }

      const response = await fetch('/api/hosts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotifyId: session.user.id,
          ...details,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentStep('complete');
          setTimeout(() => {
            router.push('/host/dashboard');
          }, 2000);
        } else {
          console.error('Failed to create host', data);
          signOut();
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create host');
      }
    } catch (error) {
      console.error('Error creating host:', error);
      // TODO: Show error to user
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>Create Your Jukebox - PlebFM</title>
      </Head>

      <div className="max-w-xl mx-auto pt-8 px-4">
        {/* Step Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {currentStep !== 'spotify' && (
                <button
                  onClick={handleBack}
                  className="mr-4 p-1 rounded-full hover:bg-white/5 transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-white/70" />
                </button>
              )}
              <h1 className="text-2xl font-medium text-white">
                {currentStepInfo.title}
              </h1>
            </div>
            <div className="flex items-center space-x-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    index <= currentStepIndex ? 'bg-orange-300' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-white/60 ml-0">{currentStepInfo.description}</p>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-8"
          >
            {currentStep === 'spotify' && (
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
                      PlebFM uses Spotify to play music at your venue. You'll
                      need a Premium account to control playback.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="min-w-8 mt-1">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white/80">
                          1
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">
                        Premium Account Required
                      </h3>
                      <p className="text-white/60 text-sm">
                        Make sure you&apos;re using a Spotify Premium account to
                        enable playback control.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="min-w-8 mt-1">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white/80">
                          2
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">
                        Grant Permissions
                      </h3>
                      <p className="text-white/60 text-sm">
                        You&apos;ll need to allow PlebFM to control playback and
                        manage your queue.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <SpotifyAuthButton
                    onSuccess={() => setCurrentStep('details')}
                  />
                </div>

                <div className="text-center text-white/40 text-sm">
                  By connecting, you agree to our Terms of Service and Privacy
                  Policy
                </div>
              </div>
            )}

            {currentStep === 'details' && session && (
              <div className="space-y-6">
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="hostName"
                      className="block text-sm font-medium text-white/90 mb-2"
                    >
                      Venue Name
                    </label>
                    <input
                      type="text"
                      id="hostName"
                      required
                      placeholder="e.g. Atlanta BitDevs"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-300/50"
                      value={details.hostName}
                      onChange={e =>
                        setDetails({ ...details, hostName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shortName"
                      className="block text-sm font-medium text-white/90 mb-2"
                    >
                      URL Slug
                    </label>
                    <div className="flex items-center">
                      <span className="text-white/50 mr-2">/</span>
                      <input
                        type="text"
                        id="shortName"
                        required
                        placeholder="atl"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-300/50"
                        value={details.shortName}
                        onChange={e =>
                          setDetails({
                            ...details,
                            shortName: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-orange-300/90 hover:bg-orange-300 text-black rounded-lg transition-colors"
                  >
                    Create Jukebox
                  </button>
                </form>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 mx-auto bg-orange-300/20 rounded-full flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-orange-300/40 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-orange-300 rounded-full" />
                  </div>
                </motion.div>
                <p className="text-white/80">
                  Your jukebox has been created. Redirecting you to your
                  dashboard...
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
