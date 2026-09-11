import { Readable } from 'node:stream';
import { Webhook } from 'standardwebhooks';
import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  ensure: vi.fn(),
  host: vi.fn(),
  token: vi.fn(),
  guest: vi.fn(),
  order: vi.fn(),
  reconcile: vi.fn(),
  create: vi.fn(),
}));
vi.mock('../../lib/db', () => ({ ensureDB: mocks.ensure }));
vi.mock('../../middleware/mongodb', () => ({ default: (h: any) => h }));
vi.mock('../../lib/auth', () => ({ assertSameOrigin: vi.fn() }));
vi.mock('../../lib/guest', () => ({ guestId: mocks.guest }));
vi.mock('../../lib/spotify', () => ({ getAccessToken: mocks.token }));
vi.mock('../../models/Host', () => ({ default: { findOne: mocks.host } }));
vi.mock('../../models/User', () => ({
  default: { findOne: () => ({ lean: async () => ({ userId: 'guest' }) }) },
}));
vi.mock('../../models/PaymentOrder', () => ({
  default: { findOne: mocks.order },
}));
vi.mock('../../lib/payments/orders', () => ({
  reconcileOrder: mocks.reconcile,
  createBidOrder: mocks.create,
}));
vi.mock('../../lib/billing', () => ({ reconcileBilling: vi.fn() }));
vi.mock('../../lib/mdk-subscriptions', () => ({
  syncMdkSubscriptions: vi.fn(),
}));
vi.mock('../../models/BillingCheckout', () => ({
  default: { findOne: async () => null },
}));
vi.mock('../../models/HostSubscription', () => ({
  default: { findOne: async () => null },
}));
import withJukebox from '../../middleware/withJukebox';
import invoice from '../../pages/api/invoice';
import webhook from '../../pages/api/webhooks/mdk';
const response = () => ({
  statusCode: 200,
  body: null as any,
  setHeader: vi.fn(),
  status(n: number) {
    this.statusCode = n;
    return this;
  },
  json(b: any) {
    this.body = b;
    return this;
  },
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.host.mockResolvedValue({ hostId: 'venue' });
  mocks.token.mockResolvedValue({ access_token: 'catalog' });
  mocks.guest.mockReturnValue('guest');
  mocks.order.mockResolvedValue({
    orderId: '11111111-1111-1111-1111-111111111111',
    statusRef: 'checkout',
  });
  mocks.reconcile.mockResolvedValue({ state: 'fulfilled' });
});
it('scopes catalog lookup to the requested venue', async () => {
  const h = vi.fn();
  await withJukebox(h)(
    { method: 'GET', query: { shortName: 'venue-b' }, headers: {} } as any,
    response() as any,
  );
  expect(mocks.host).toHaveBeenCalledWith({
    shortName: 'venue-b',
    deletedAt: null,
  });
  expect(h).toHaveBeenCalledOnce();
});
it('settlement ignores client bid amount, song, host, and user claims', async () => {
  const id = '11111111-1111-1111-1111-111111111111';
  await invoice(
    {
      method: 'GET',
      query: {
        hash: id,
        bidAmount: '999999',
        songId: 'changed',
        hostId: 'other',
        userId: 'victim',
      },
    } as any,
    response() as any,
  );
  expect(mocks.order).toHaveBeenCalledWith({
    orderId: id,
    'user.userId': 'guest',
  });
  expect(mocks.reconcile).toHaveBeenCalledWith(id);
});
it('rejects legacy hashes and another guest checkout', async () => {
  await expect(
    invoice(
      { method: 'GET', query: { hash: 'f'.repeat(64) } } as any,
      response() as any,
    ),
  ).resolves.toMatchObject({ statusCode: 400 });
  mocks.order.mockResolvedValue(null);
  await expect(
    invoice(
      {
        method: 'GET',
        query: { hash: '11111111-1111-1111-1111-111111111111' },
      } as any,
      response() as any,
    ),
  ).resolves.toMatchObject({ statusCode: 404 });
  expect(mocks.reconcile).not.toHaveBeenCalled();
});
it('does not process an unsigned payment webhook', async () => {
  process.env.MDK_WEBHOOK_SECRET =
    'whsec_' +
    Buffer.from('test-secret-32-bytes-long-abcdefg').toString('base64');
  const req = Object.assign(Readable.from(['{}']), {
    method: 'POST',
    headers: {},
  });
  const res = response();
  await webhook(req as any, res as any);
  expect(res.statusCode).toBe(401);
  expect(mocks.ensure).not.toHaveBeenCalled();
});
it('reads and verifies the exact raw request stream before reconciling', async () => {
  const secret =
    'whsec_' +
    Buffer.from('test-secret-32-bytes-long-abcdefg').toString('base64');
  process.env.MDK_WEBHOOK_SECRET = secret;
  const body = JSON.stringify({
    type: 'checkout.completed',
    data: { metadata: { bidOrderId: 'order' } },
  });
  const now = new Date();
  const wh = new Webhook(secret);
  const req = Object.assign(
    Readable.from([body.slice(0, 20), body.slice(20)]),
    {
      method: 'POST',
      headers: {
        'webhook-id': 'evt-1',
        'webhook-timestamp': String(Math.floor(now.getTime() / 1000)),
        'webhook-signature': wh.sign('evt-1', now, body),
      },
    },
  );
  const res = response();
  await webhook(req as any, res as any);
  expect(res.statusCode).toBe(200);
  expect(mocks.reconcile).toHaveBeenCalledOnce();
});
it('refuses a webhook whose body changes after signing', async () => {
  const secret =
    'whsec_' +
    Buffer.from('test-secret-32-bytes-long-abcdefg').toString('base64');
  process.env.MDK_WEBHOOK_SECRET = secret;
  const now = new Date();
  const req = Object.assign(Readable.from(['{"changed":true}']), {
    method: 'POST',
    headers: {
      'webhook-id': 'evt-2',
      'webhook-timestamp': String(Math.floor(now.getTime() / 1000)),
      'webhook-signature': new Webhook(secret).sign('evt-2', now, '{}'),
    },
  });
  const res = response();
  await webhook(req as any, res as any);
  expect(res.statusCode).toBe(401);
});
