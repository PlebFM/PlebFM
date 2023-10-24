import { useState } from 'react';
import { Input } from '../Utils/Input';
import Button from '../Utils/Button';
type FormData = {
  name: string;
  email: string;
  nostr: string;
};

export const SignupForm = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold">Sign Up</h3>

      <p>
        Interested in starting your own Jukebox? Awesome, we&rsquo;ll be in
        touch to help you out.
      </p>

      <form
        name="signup"
        action={'/'}
        method="POST"
        data-netlify="true"
        //@ts-ignore
        netlify
        className="flex flex-col gap-y-8 py-8"
        // onSubmit={(e) => handleSubmit(e).then(() => alert("Thanks! We'll be in touch."))}
      >
        <input type="hidden" name="form-name" value="signup" />
        <div>
          <label htmlFor="name">Name / Nym</label>
          <Input name="name" id="name" placeholder="SatBoy Slim" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="satstacker69@atlbitlab.com"
          />
        </div>
        <div>
          <label htmlFor="nostr">Nostr Npub / NIP-05</label>
          <Input name="nostr" id="nostr" placeholder="npub123abc..." />
        </div>

        <Button submit>Submit</Button>
      </form>
    </div>
  );
};
