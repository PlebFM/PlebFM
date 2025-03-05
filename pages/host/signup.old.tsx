import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import HostLoginLayout from '../../components/Signup/HostLoginLayout';
import { useHostLogin } from '../../components/hooks/useHostLogin';
import SpotifyStep from '../../components/Signup/SpotifyStep';
import DetailsStep from '../../components/Signup/DetailsStep';
import CompleteStep from '../../components/Signup/CompleteStep';

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
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('spotify');
  const [details, setDetails] = useState<JukeboxDetails>({
    hostName: '',
    shortName: '',
  });

  const { isVerified, isLoading } = useHostLogin();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepInfo = steps[currentStepIndex];

  const handleBack = () => {
    if (currentStep === 'details') {
      signOut();
    } else if (currentStep === 'complete') {
      setCurrentStep('details');
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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
    <HostLoginLayout title="Create Your Jukebox">
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
            <SpotifyStep
              session={session}
              isLoading={isLoading}
              isVerified={isVerified}
              onContinue={() => setCurrentStep('details')}
            />
          )}

          {currentStep === 'details' && session && (
            <DetailsStep
              session={session}
              details={details}
              onDetailsChange={setDetails}
              onSubmit={handleDetailsSubmit}
            />
          )}

          {currentStep === 'complete' && <CompleteStep />}
        </motion.div>
      </AnimatePresence>
    </HostLoginLayout>
  );
}
