import Section from './Section';
import JukeboxLink from './JukeboxLink';
import { useHosts } from '../hooks/useHost';

export default function UserSection() {
  const { hosts, isLoading, error } = useHosts();

  return (
    <Section>
      <h2 className="text-2xl font-medium mb-4">Ready to Play Music?</h2>
      <p className="mb-6 text-white/80">
        Join an active jukebox and start bidding on your favorite songs.
      </p>

      <h3 className="text-xl mb-4">Active Jukeboxes</h3>

      {error && (
        <p className="text-red-400 mb-4">Unable to load jukeboxes: {error}</p>
      )}

      {isLoading ? (
        <p className="text-white/60">Loading jukeboxes...</p>
      ) : hosts.length === 0 ? (
        <p className="text-white/60">No active jukeboxes found</p>
      ) : (
        <ul className="space-y-2">
          {hosts.map(host => (
            <JukeboxLink key={host.shortName} href={`/${host.shortName}`}>
              {host.hostName}
            </JukeboxLink>
          ))}
        </ul>
      )}
    </Section>
  );
}
