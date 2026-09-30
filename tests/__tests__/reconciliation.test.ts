import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
vi.mock('../../lib/payments/orders', () => ({ reconcileOrder: vi.fn() }));
vi.mock('../../lib/billing', () => ({ reconcileBilling: vi.fn() }));
vi.mock('../../lib/payouts', () => ({ processPayout: vi.fn() }));
vi.mock('../../lib/mdk-subscriptions', () => ({
  syncMdkSubscriptions: vi.fn(),
}));
import handler from '../../pages/api/jobs/reconcile';
import { reconcileOrder } from '../../lib/payments/orders';
import Orders from '../../models/PaymentOrder';
let repl: MongoMemoryReplSet;
beforeAll(async () => {
  repl = await MongoMemoryReplSet.create({
    binary: { version: '7.0.14' },
    replSet: { count: 1 },
  });
  await mongoose.connect(repl.getUri());
  await Orders.init();
}, 120000);
afterAll(async () => {
  await mongoose.disconnect();
  await repl?.stop();
});
beforeEach(async () => {
  await Orders.deleteMany({});
  vi.clearAllMocks();
  vi.stubEnv('CRON_SECRET', 'fixture-secret');
});
afterEach(() => vi.unstubAllEnvs());
const run = async () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    setHeader: vi.fn(),
  };
  await handler(
    {
      method: 'GET',
      headers: { authorization: 'Bearer fixture-secret' },
    } as any,
    res as any,
  );
  return res;
};
const order = {
  orderId: 'order',
  requestKey: 'guest:request',
  hostId: 'venue',
  shortName: 'venue',
  user: { userId: 'guest' },
  song: { id: 'song' },
  amountSats: 10,
  provider: 'mdk',
};
it('reconciles a pending order using statusRef without a nonexistent checkoutId field', async () => {
  await Orders.create({
    ...order,
    statusRef: 'checkout',
    mintState: 'ready',
    state: 'pending',
  });
  const res = await run();
  expect(reconcileOrder).toHaveBeenCalledWith('order');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    checked: 1,
    failures: 0,
    unresolved: 0,
  });
});
it('reports an old creation without a provider reference instead of silently skipping it', async () => {
  await Orders.create({ ...order, createdAt: new Date(Date.now() - 180000) });
  const res = await run();
  expect(reconcileOrder).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(503);
  expect(res.json).toHaveBeenCalledWith({
    checked: 0,
    failures: 0,
    unresolved: 1,
  });
});
