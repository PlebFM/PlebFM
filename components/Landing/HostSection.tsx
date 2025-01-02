import Section from './Section';
import Button from './Button';

export default function HostSection() {
  return (
    <Section variant="host">
      <h2 className="text-2xl font-medium mb-4">Want to Host?</h2>
      <p className="mb-6 text-white/80">
        Create your own jukebox for your venue, event, or space.
      </p>

      <div className="space-y-4">
        <Button href="/host/signup" variant="primary">
          Create a Jukebox
        </Button>
        <Button href="/host/learn-more" variant="secondary">
          Learn More
        </Button>
        <Button href="/host/login" variant="text">
          Already a host? Log in
        </Button>
      </div>
    </Section>
  );
}
