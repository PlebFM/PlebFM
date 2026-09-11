const assert = require('node:assert/strict');
const base = 'http://localhost:3100';
(async () => {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  assert(ready, 'Local fixture did not start');
  const signin = await fetch('http://localhost:3101/signin', {
    redirect: 'manual',
  });
  assert.equal(signin.status, 302);
  const cookie = signin.headers.get('set-cookie').split(';')[0];
  const request = (path, options = {}, auth = false) =>
    fetch(base + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Cookie: cookie } : {}),
        ...options.headers,
      },
    });
  let r = await request('/api/hosts');
  assert.equal(r.status, 200);
  let body = await r.json();
  assert(body.hosts.some(h => h.hostId === 'fixture-host'));
  assert(!JSON.stringify(body).includes('TEST-ONLY-NOT-A-REAL-TOKEN'));
  assert(!JSON.stringify(body).includes('spotifyRefreshToken'));
  r = await request('/api/hosts/local-venue');
  assert.equal(r.status, 200);
  assert(!JSON.stringify(await r.json()).includes('spotifyRefreshToken'));
  r = await request('/api/hosts', {
    method: 'PATCH',
    body: JSON.stringify({ hostName: 'unauthorized' }),
  });
  assert.equal(r.status, 401);
  r = await request('/api/hosts/local-venue', { method: 'POST', body: '{}' });
  assert.equal(r.status, 405);
  r = await request(
    '/api/hosts',
    {
      method: 'PATCH',
      headers: { Origin: 'https://other.example' },
      body: JSON.stringify({ hostName: 'cross-origin' }),
    },
    true,
  );
  assert.equal(r.status, 403);
  r = await request('/api/subscriptions/current', {}, true);
  assert.equal(r.status, 200);
  body = await r.json();
  assert.equal(body.plan.id, 'pro');
  assert.equal(body.history[0].amount, 2000);
  r = await request('/api/billing/receipt?id=fixture-receipt', {}, true);
  assert.equal(r.status, 200);
  assert((await r.text()).includes('20 USD'));
  assert(r.headers.get('content-disposition').includes('attachment'));
  r = await request('/api/billing/receipt?id=fixture-receipt');
  assert.equal(r.status, 401);
  r = await request('/api/billing/receipt?id=other-receipt', {}, true);
  assert.equal(r.status, 404);
  r = await request('/api/payouts', {}, true);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).balanceSats, 90);
  r = await request(
    '/api/host-account',
    { method: 'DELETE', body: JSON.stringify({ confirmation: 'local-venue' }) },
    true,
  );
  assert.equal(r.status, 409);
  r = await request('/api/leaderboard/queue?shortName=local-venue');
  assert.equal(r.status, 200);
  assert.deepEqual((await r.json()).data, []);
  r = await request('/api/invoice?hash=legacy-hash');
  assert.equal(r.status, 401);
  r = await request('/api/jobs/reconcile');
  assert.equal(r.status, 401);
  for (const handler of ['create_checkout', 'get_customer', 'pay_invoice']) {
    r = await request('/api/mdk', {
      method: 'POST',
      body: JSON.stringify({ handler }),
    });
    assert.equal(r.status, 403);
  }
  console.log(
    '18 production HTTP smoke checks passed against the disposable fixture.',
  );
})().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});
