import { useEffect, useState } from 'react';
export function PayoutSettings() {
  const [data, setData] = useState<any>(null),
    [amount, setAmount] = useState(''),
    [destination, setDestination] = useState(''),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const res = await fetch('/api/payouts');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setData(body);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function withdraw(record?: any) {
    setBusy(true);
    setStatus('');
    const key = 'plebfm-withdrawal';
    const requestId =
      record?.requestKey?.split(':').pop() ||
      sessionStorage.getItem(key) ||
      crypto.randomUUID();
    if (!record) sessionStorage.setItem(key, requestId);
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          amountSats: record?.amountSats ?? Number(amount),
          destination: record?.destination ?? destination,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setData(body);
      if (!record) {
        sessionStorage.removeItem(key);
        setAmount('');
        setDestination('');
      }
      setStatus('Withdrawal status updated.');
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
      await load();
    }
  }
  return (
    <section className="p-6 bg-white/5 border border-white/10 rounded-lg text-white space-y-4">
      <h3 className="text-lg">Withdraw earnings</h3>
      <p>{data?.balanceSats?.toLocaleString() ?? '…'} sats available</p>
      <p className="text-white/60">
        Earnings accrue on bids placed while Pro is active. Pending withdrawals
        are deducted from your available balance.
      </p>
      {data?.enabled ? (
        <form
          className="space-y-3"
          onSubmit={e => {
            e.preventDefault();
            void withdraw();
          }}
        >
          <label className="block">
            Amount in sats
            <input
              type="number"
              min={1}
              step={1}
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="block p-2 bg-black border border-white/20 rounded"
            />
          </label>
          <label className="block">
            Lightning address
            <input
              required
              placeholder="you@example.com"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="block p-2 bg-black border border-white/20 rounded w-full"
            />
          </label>
          <button disabled={busy} className="bg-purple-600 rounded px-4 py-2">
            Withdraw sats
          </button>
        </form>
      ) : (
        <p>
          Withdrawals are awaiting account setup. Your earned balance is
          retained.
        </p>
      )}
      {data?.payouts.map((p: any) => (
        <div className="border-t border-white/10 pt-3" key={p._id}>
          {p.amountSats} sats to {p.destination} — {p.state}
          {['pending', 'reserved'].includes(p.state) && (
            <button
              disabled={busy}
              className="underline ml-4"
              onClick={() => withdraw(p)}
            >
              Check / retry
            </button>
          )}
        </div>
      ))}
      {status && <p role="status">{status}</p>}
    </section>
  );
}
