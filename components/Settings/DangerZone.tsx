import { useState } from 'react';
import { signOut } from 'next-auth/react';
export function DangerZone({ shortName }: { shortName: string }) {
  const [confirmation, setConfirmation] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function remove(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/host-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      await signOut({ callbackUrl: '/' });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form onSubmit={remove} className="text-white space-y-4">
      <h3 className="text-lg text-red-300">Delete jukebox</h3>
      <p>
        This removes your public jukebox, saved Spotify connection, and queue.
        Payment records are retained. Withdraw your balance, resolve pending
        payments, and remove your domain first.
      </p>
      <label className="block">
        Type {shortName} to confirm
        <input
          className="block bg-black border border-white/20 rounded p-2 mt-2"
          value={confirmation}
          onChange={e => setConfirmation(e.target.value)}
        />
      </label>
      <button
        disabled={busy || confirmation !== shortName}
        className="bg-red-700 disabled:opacity-40 px-4 py-2 rounded"
      >
        Delete jukebox
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
