import { useState } from 'react';
import { Input } from '../Utils/Input';
import Button from '../Utils/Button';
type FormData = {
  name: string;
  email: string;
  nostr: string;
};

export const SignupForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    nostr: '',
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormData({
      name: '',
      email: '',
      nostr: '',
    });
    alert("Thanks! We'll be in touch!");
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold">Sign Up</h3>

      <p>
        Interested in starting your own Jukebox? Awesome, we&rsquo;ll be in
        touch to help you out.
      </p>

      <form
        name="plebfm-jukebox-signup"
        data-netlify="true"
        className="flex flex-col gap-y-8 py-8"
        onSubmit={handleSubmit}
        method="POST"
      >
        <input type="hidden" name="form-name" value="plebfm-jukebox-signup" />
        <div>
          <label htmlFor="name">Name / Nym</label>
          <Input
            name="name"
            id="name"
            placeholder="SatBoy Slim"
            value={formData.name}
            required
            onChange={e => {
              setFormData({ ...formData, name: e.target.value });
            }}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="satstacker69@atlbitlab.com"
            value={formData.email}
            onChange={e => {
              setFormData({ ...formData, email: e.target.value });
            }}
          />
        </div>
        <div>
          <label htmlFor="nostr">Nostr Npub / NIP-05</label>
          <Input
            name="nostr"
            id="nostr"
            placeholder="npub123abc..."
            value={formData.nostr}
            onChange={e => {
              setFormData({ ...formData, nostr: e.target.value });
            }}
          />
        </div>

        <Button submit>Submit</Button>
      </form>
    </div>
  );
};
