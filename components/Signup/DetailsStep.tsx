import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';

interface JukeboxDetails {
  hostName: string;
  shortName: string;
}

interface DetailsStepProps {
  session: Session | null;
  details: JukeboxDetails;
  onDetailsChange: (details: JukeboxDetails) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DetailsStep({
  session,
  details,
  onDetailsChange,
  onSubmit,
}: DetailsStepProps) {
  const router = useRouter();

  useEffect(() => {
    const checkExistingHost = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/hosts?spotifyId=${session.user.id}`);
        const data = await res.json();
        const host = data.hosts[0];

        if (host?.hostName && host?.shortName) {
          router.push('/host/dashboard');
        }
      } catch (error) {
        console.error('Error checking host:', error);
      }
    };

    checkExistingHost();
  }, [session, router]);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
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
              onDetailsChange({ ...details, hostName: e.target.value })
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
                onDetailsChange({
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
  );
}
