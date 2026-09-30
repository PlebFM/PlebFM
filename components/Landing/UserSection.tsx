import Section from './Section';
import JukeboxLink from './JukeboxLink';
import { Host } from '../hooks/useHost';

interface UserSectionProps {
  hosts: Host[];
  error?: string;
}

export default function UserSection({ hosts, error }: UserSectionProps) {
  return (
    <Section>
      <h2 className="text-2xl font-medium mb-4">Ready to Play Music?</h2>
      <p className="mb-6 text-white/80">
        Join Atlanta BitDevs and start bidding on your favorite songs.
      </p>

      <h3 className="text-xl mb-4">Featured Jukebox</h3>

      {error && (
        <p className="text-red-400 mb-4">Unable to load jukeboxes: {error}</p>
      )}

      {hosts.length === 0 ? (
        <p className="text-white/60">
          Atlanta BitDevs is currently unavailable
        </p>
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
