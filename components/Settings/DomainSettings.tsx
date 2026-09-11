import { useEffect, useState } from 'react';
export function DomainSettings() {
  const [data, setData] = useState<any>(null),
    [domain, setDomain] = useState(''),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false);
  async function request(method = 'GET', action?: string) {
    setBusy(true);
    try {
      const res = await fetch('/api/domain', {
        method,
        ...(method === 'POST'
          ? {
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain, action }),
            }
          : {}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setData(body);
      setStatus('');
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    fetch('/api/domain')
      .then(async res => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error);
        setData(body);
      })
      .catch(e => setStatus(e.message));
  }, []);
  return (
    <section className="p-6 bg-white/5 border border-white/10 rounded-lg text-white space-y-4">
      <h3 className="text-lg">Custom domain</h3>
      <p className="text-white/60">
        Available on Basic and Pro. Connect a domain you own to this jukebox.
      </p>
      {!data?.domain ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            void request('POST');
          }}
        >
          <label>
            Domain
            <input
              placeholder="music.yourvenue.com"
              className="block w-full bg-black border border-white/20 rounded p-3 mt-2"
              value={domain}
              onChange={e => setDomain(e.target.value.trim().toLowerCase())}
            />
          </label>
          <button disabled={busy} className="mt-3 underline">
            Save domain
          </button>
        </form>
      ) : (
        <>
          <p>
            {data.domain.domain} —{' '}
            {data.domain.verified ? 'Connected' : 'Awaiting DNS verification'}
          </p>
          <p>Add a TXT record at your DNS provider:</p>
          <code className="block break-all">
            {data.challenge.name} = {data.challenge.value}
          </code>
          {data.domain.verification?.records?.map((r: any, i: number) => (
            <p className="break-all" key={i}>
              {r.type} {r.domain}: {r.value}
            </p>
          ))}
          {data.domain.dns && (
            <pre className="whitespace-pre-wrap break-all text-sm">
              {JSON.stringify(data.domain.dns, null, 2)}
            </pre>
          )}
          <button
            disabled={busy}
            className="underline mr-6"
            onClick={() => request('POST', 'verify')}
          >
            Verify connection
          </button>
          <button
            disabled={busy}
            className="underline"
            onClick={() => request('DELETE')}
          >
            Remove domain
          </button>
        </>
      )}
      {status && <p role="status">{status}</p>}
    </section>
  );
}
