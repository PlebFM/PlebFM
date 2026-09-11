import { useState } from 'react';
export function AppearanceSettings({
  color,
  message,
}: {
  color?: string;
  message?: string;
}) {
  const [accentColor, setColor] = useState(color || '#a855f7'),
    [welcomeMessage, setMessage] = useState(message || ''),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/hosts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accentColor, welcomeMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('Appearance saved.');
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={save}
      className="bg-white/5 p-6 rounded-lg text-white space-y-4"
    >
      <p className="text-white/60">
        Pro hosts can customize their public jukebox header.
      </p>
      <label className="block">
        Accent color
        <input
          aria-label="Accent color"
          type="color"
          value={accentColor}
          onChange={e => setColor(e.target.value)}
          className="block mt-2"
        />
      </label>
      <label className="block">
        Welcome message
        <input
          maxLength={160}
          value={welcomeMessage}
          onChange={e => setMessage(e.target.value)}
          className="block w-full mt-2 bg-black border border-white/20 p-3 rounded"
        />
      </label>
      <button disabled={busy} className="bg-purple-600 px-4 py-2 rounded">
        Save appearance
      </button>
      {status && <p role="status">{status}</p>}
    </form>
  );
}
