import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SpotifyAuthButton from '../../components/Leaderboard/SpotifyAuthButton';
import Head from 'next/head';
import { useRouter } from 'next/router';

type OnboardingStep = 'spotify' | 'details' | 'complete';

interface JukeboxDetails {
  hostName: string;
  shortName: string;
}

export default function HostSignup() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('spotify');
  const [details, setDetails] = useState<JukeboxDetails>({
    hostName: '',
    shortName: '',
  });
  const router = useRouter();

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
          throw new Error(data.error || 'Failed to create host');
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

      <div className="max-w-xl mx-auto pt-16 px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          {currentStep === 'spotify' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-medium text-white">
                Connect Spotify
              </h1>
              <p className="text-white/80">
                First, connect your Spotify account. This will be used to
                control music playback.
              </p>
              <div className="pt-4">
                <SpotifyAuthButton
                  onSuccess={() => setCurrentStep('details')}
                />
              </div>
            </div>
          )}

          {currentStep === 'details' && session && (
            <div className="space-y-6">
              <h1 className="text-2xl font-medium text-white">
                Jukebox Details
              </h1>
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
              <h1 className="text-2xl font-medium text-white">All Set!</h1>
              <p className="text-white/80">
                Your jukebox has been created. Redirecting you to your
                dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
