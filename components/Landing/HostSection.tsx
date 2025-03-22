import { memo } from 'react';
import Section from './Section';
import Button from './Button';

const HostSection = memo(function HostSection() {
  return (
    <Section variant="host">
      <h2 className="text-2xl font-medium mb-4">Want to Host?</h2>
      <p className="mb-6 text-white/80">
        Create your own jukebox for your venue, event, or space.
      </p>

      <div className="space-y-4">
        <Button href="/host/signup" variant="primary" prefetch={true}>
          Create a Jukebox
        </Button>
        <Button href="/host/learn-more" variant="secondary" prefetch={false}>
          Learn More
        </Button>
        <Button href="/host/login" variant="text" prefetch={true}>
          Already a host? Log in
        </Button>
      </div>
    </Section>
  );
});

export default HostSection;
