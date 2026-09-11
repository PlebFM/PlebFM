import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
export function BillingSettings({ hostId }: { hostId: string }) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  const load = useCallback(async (method = 'GET') => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/subscriptions/current', { method });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setData(body);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void load(router.query.refresh ? 'POST' : 'GET');
  }, [load, router.query.refresh]);
  return (
    <div className="text-white space-y-6">
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      {!data ? (
        <p>Loading billing…</p>
      ) : (
        <>
          <section className="p-6 bg-white/5 rounded-lg space-y-3">
            <h3 className="text-xl">{data.plan.name} plan</h3>
            <p>
              {data.subscription
                ? `Access through ${new Date(
                    data.subscription.currentPeriodEnd,
                  ).toLocaleDateString()}`
                : 'No paid subscription'}
            </p>
            {data.subscription?.cancelAtPeriodEnd && (
              <p>
                Cancellation scheduled. Access continues until the date above.
              </p>
            )}
            <p className="text-white/60">
              Lightning plans renew when you pay the renewal invoice. Email
              reminders arrive before the period ends; there are no automatic
              card charges.
            </p>
            <Link className="underline mr-6" href="/host/plans">
              View plans
            </Link>
            <button
              disabled={busy}
              onClick={() => load('POST')}
              className="underline mr-6"
            >
              Refresh payment status
            </button>
            {data.subscription && !data.subscription.cancelAtPeriodEnd && (
              <button
                disabled={busy}
                onClick={() => load('DELETE')}
                className="underline"
              >
                Cancel renewal
              </button>
            )}
          </section>
          <section className="p-6 bg-white/5 rounded-lg">
            <h3 className="text-xl mb-4">Payment history</h3>
            {data.history.length === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              data.history.map((item: any) => (
                <div
                  key={item.receiptId}
                  className="flex gap-4 justify-between border-b border-white/10 py-3"
                >
                  <span>
                    {item.planId} · {new Date(item.paidAt).toLocaleDateString()}
                  </span>
                  <span>
                    {item.currency === 'USD'
                      ? `$${(item.amount / 100).toFixed(2)}`
                      : `${item.amount} sats`}
                  </span>
                  <a
                    className="underline"
                    href={`/api/billing/receipt?id=${encodeURIComponent(
                      item.receiptId,
                    )}`}
                  >
                    Download receipt
                  </a>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
