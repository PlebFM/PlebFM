import { Readable } from 'node:stream';
import Stripe from 'stripe';
import { beforeEach, expect, it, vi } from 'vitest';
const ensure = vi.hoisted(() => vi.fn());
vi.mock('../../lib/db', () => ({ ensureDB: ensure }));
import handler from '../../pages/api/billing/webhook';
const response = () => ({
  statusCode: 200,
  status(n: number) {
    this.statusCode = n;
    return this;
  },
  json: vi.fn(),
  setHeader: vi.fn(),
});
beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_fixture';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fixture';
});
it('accepts a valid Stripe signature over a split raw request stream', async () => {
  const body = JSON.stringify({
    id: 'evt_test',
    type: 'test.event',
    data: { object: {} },
  });
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: 'whsec_fixture',
  });
  const req = Object.assign(
    Readable.from([body.slice(0, 10), body.slice(10)]),
    { method: 'POST', headers: { 'stripe-signature': signature } },
  );
  const res = response();
  await handler(req as any, res as any);
  expect(res.statusCode).toBe(200);
  expect(ensure).toHaveBeenCalledOnce();
});
it('rejects a tampered Stripe payload before database access', async () => {
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload: '{}',
    secret: 'whsec_fixture',
  });
  const req = Object.assign(Readable.from(['{"tampered":true}']), {
    method: 'POST',
    headers: { 'stripe-signature': signature },
  });
  const res = response();
  await handler(req as any, res as any);
  expect(res.statusCode).toBe(400);
  expect(ensure).not.toHaveBeenCalled();
});
