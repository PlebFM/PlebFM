import { beforeAll, afterAll, beforeEach, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
vi.mock('../../lib/payments/registry', () => ({
  getPaymentProvider: vi.fn(),
  getProviderByName: vi.fn(),
}));
vi.mock('../../lib/db', () => ({ ensureDB: async () => {} }));
vi.mock('../../lib/spotify', () => ({
  getAccessToken: async () => ({ access_token: 'catalog' }),
  getTrack: async () => ({
    id: 'a'.repeat(22),
    name: 'Song',
    duration_ms: 180000,
  }),
}));
vi.mock('@moneydevkit/core/server', () => ({
  programmaticPayout: vi.fn(),
  waitForPayoutResult: vi.fn(),
}));
vi.mock('../../lib/pusher', () => ({ triggerBid: vi.fn() }));
import Orders from '../../models/PaymentOrder';
import Accounts from '../../models/HostAccount';
import Plays from '../../models/Play';
import Payouts from '../../models/Payout';
import { reservePayout } from '../../lib/payouts';
import { fulfillBidOrder, createBidOrder } from '../../lib/payments/orders';
let mongo: MongoMemoryReplSet;
beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: '7.0.14' },
  });
  await mongoose.connect(mongo.getUri());
  await Promise.all([
    Orders.init(),
    Accounts.init(),
    Plays.init(),
    Payouts.init(),
  ]);
}, 120000);
afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
beforeEach(async () => {
  await Promise.all([
    Orders.deleteMany({}),
    Accounts.deleteMany({}),
    Plays.deleteMany({}),
    Payouts.deleteMany({}),
  ]);
  await Accounts.create({ _id: 'venue' });
  await Orders.create({
    orderId: 'order',
    requestKey: 'request',
    hostId: 'venue',
    shortName: 'venue',
    user: { userId: 'anon', firstNym: 'Anon', lastNym: '', avatar: 'anon' },
    song: { id: 'song', name: 'Song', duration_ms: 180000 },
    amountSats: 10,
    provider: 'mdk',
    paymentHash: 'hash',
    statusRef: 'checkout',
    earnsRevenue: true,
  });
});
const paid = {
  settled: true,
  paymentHash: 'hash',
  amountSats: 10,
  netAmountSats: 9,
  currency: 'SAT',
};
it('credits exactly once under simultaneous callbacks and later replay', async () => {
  await Promise.all(
    Array.from({ length: 10 }, () => fulfillBidOrder('order', paid)),
  );
  await fulfillBidOrder('order', paid);
  expect(await Plays.countDocuments()).toBe(1);
  expect((await Plays.findOne()).bids).toHaveLength(1);
  expect((await Accounts.findById('venue')).balanceSats).toBe(9);
  expect((await Orders.findOne()).state).toBe('fulfilled');
}, 30000);
it('rejects underpayment without creating a bid or balance', async () => {
  await expect(
    fulfillBidOrder('order', { ...paid, amountSats: 1 }),
  ).rejects.toThrow('match');
  expect(await Plays.countDocuments()).toBe(0);
  expect((await Accounts.findById('venue')).balanceSats).toBe(0);
});
it('rejects another payment identity and currency', async () => {
  await expect(
    fulfillBidOrder('order', { ...paid, paymentHash: 'other' }),
  ).rejects.toThrow('match');
  await expect(
    fulfillBidOrder('order', { ...paid, currency: 'USD' }),
  ).rejects.toThrow('match');
});
it('does not reuse a paid order when the song leaves the queue', async () => {
  await fulfillBidOrder('order', paid);
  await Plays.updateMany({}, { $set: { status: 'played' } });
  await fulfillBidOrder('order', paid);
  expect(await Plays.countDocuments()).toBe(1);
});
it('rolls back all writes if a bid cannot be saved', async () => {
  await Orders.updateOne({ orderId: 'order' }, { $set: { 'song.name': null } });
  await expect(fulfillBidOrder('order', paid)).rejects.toThrow();
  expect((await Accounts.findById('venue')).balanceSats).toBe(0);
  expect((await Orders.findOne()).state).toBe('pending');
});

it('atomically reserves withdrawals so two requests cannot overspend', async () => {
  await Accounts.updateOne({ _id: 'venue' }, { $set: { balanceSats: 100 } });
  const results = await Promise.allSettled([
    reservePayout('venue', 'request-1111111111', 80, 'one@example.com'),
    reservePayout('venue', 'request-2222222222', 80, 'two@example.com'),
  ]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect((await Accounts.findById('venue')).balanceSats).toBe(20);
  expect(await Payouts.countDocuments()).toBe(1);
});
it('reserves one withdrawal when the same request is retried concurrently', async () => {
  await Accounts.updateOne({ _id: 'venue' }, { $set: { balanceSats: 100 } });
  await Promise.all(
    [1, 2, 3].map(() =>
      reservePayout('venue', 'request-1111111111', 80, 'one@example.com'),
    ),
  );
  expect((await Accounts.findById('venue')).balanceSats).toBe(20);
  expect(await Payouts.countDocuments()).toBe(1);
});

import Subscriptions from '../../models/HostSubscription';
import { subscriptionForHost } from '../../lib/subscriptions';
import { saveSubscription } from '../../lib/save-subscription';
import { expireOrder } from '../../lib/payments/orders';
it('releases an expired reservation exactly once, without going negative', async () => {
  await Accounts.updateOne(
    { _id: 'venue' },
    { $set: { month: '2026-09', songCount: 1 } },
  );
  await Orders.updateOne(
    { orderId: 'order' },
    { $set: { reservationMonth: '2026-09' } },
  );
  await Promise.all([expireOrder('order'), expireOrder('order')]);
  expect((await Accounts.findById('venue')).songCount).toBe(0);
  expect((await Orders.findOne()).state).toBe('expired');
});
it('never releases the allowance for a fulfilled order', async () => {
  await Accounts.updateOne(
    { _id: 'venue' },
    { $set: { month: '2026-09', songCount: 1 } },
  );
  await Orders.updateOne(
    { orderId: 'order' },
    { $set: { reservationMonth: '2026-09' } },
  );
  await fulfillBidOrder('order', paid);
  await expireOrder('order');
  expect((await Accounts.findById('venue')).songCount).toBe(1);
});
it('does not grant expired or immediately canceled subscriptions', async () => {
  await Subscriptions.deleteMany({});
  await Subscriptions.create({
    provider: 'stripe',
    externalId: 'sub',
    hostId: 'venue',
    planId: 'pro',
    status: 'canceled',
    cancelAtPeriodEnd: false,
    currentPeriodEnd: new Date(Date.now() + 86400000),
  });
  expect(await subscriptionForHost('venue')).toBeNull();
  await Subscriptions.updateOne(
    { externalId: 'sub' },
    { $set: { cancelAtPeriodEnd: true } },
  );
  expect((await subscriptionForHost('venue'))?.planId).toBe('pro');
  await Subscriptions.updateOne(
    { externalId: 'sub' },
    { $set: { currentPeriodEnd: new Date(0) } },
  );
  expect(await subscriptionForHost('venue')).toBeNull();
});
it('does not let an older provider response restore a canceled subscription', async () => {
  await Subscriptions.deleteMany({});
  const values = { hostId: 'venue', planId: 'pro', status: 'canceled' };
  await saveSubscription('mdk', 'sub', values, new Date(2000));
  await saveSubscription(
    'mdk',
    'sub',
    { ...values, status: 'active' },
    new Date(1000),
  );
  expect((await Subscriptions.findOne({ externalId: 'sub' })).status).toBe(
    'canceled',
  );
});

import Hosts from '../../models/Host';
import { getPaymentProvider } from '../../lib/payments/registry';
import { processPayout } from '../../lib/payouts';
import {
  programmaticPayout,
  waitForPayoutResult,
} from '@moneydevkit/core/server';
it('mints one invoice for concurrent duplicate checkout requests', async () => {
  await Hosts.deleteMany({});
  await Subscriptions.deleteMany({});
  await Hosts.create({
    hostId: 'venue',
    spotifyId: 'venue',
    shortName: 'venue',
  });
  const mint = vi.fn(async () => ({
    paymentRequest: 'invoice',
    statusRef: 'new-checkout',
    paymentHash: 'new-hash',
  }));
  vi.mocked(getPaymentProvider).mockReturnValue({
    name: 'mdk',
    createInvoice: mint,
    checkInvoice: vi.fn(),
  });
  const input = {
    shortName: 'venue',
    songId: 'a'.repeat(22),
    amountSats: 10,
    requestId: 'request-1111111111',
  };
  const user = {
    userId: 'guest',
    firstNym: 'Guest',
    lastNym: '',
    avatar: 'anon',
  };
  await Promise.all([1, 2, 3].map(() => createBidOrder(input, user)));
  expect(mint).toHaveBeenCalledOnce();
  expect(
    await Orders.countDocuments({ requestKey: 'guest:request-1111111111' }),
  ).toBe(1);
  await expect(
    createBidOrder({ ...input, amountSats: 100 }, user),
  ).rejects.toMatchObject({ status: 409 });
});
it('refuses over-limit bids before contacting the payment provider', async () => {
  await Hosts.deleteMany({});
  await Subscriptions.deleteMany({});
  await Hosts.create({
    hostId: 'venue',
    spotifyId: 'venue',
    shortName: 'venue',
  });
  vi.mocked(getPaymentProvider).mockClear();
  await expect(
    createBidOrder(
      {
        shortName: 'venue',
        songId: 'a'.repeat(22),
        amountSats: 99999999,
        requestId: 'request-1111111111',
      },
      { userId: 'guest', firstNym: 'Guest', lastNym: '', avatar: 'anon' },
    ),
  ).rejects.toMatchObject({ status: 400 });
  expect(getPaymentProvider).not.toHaveBeenCalled();
});
it('refunds a confirmed failed withdrawal exactly once', async () => {
  await Accounts.updateOne({ _id: 'venue' }, { $set: { balanceSats: 100 } });
  const payout = await reservePayout(
    'venue',
    'request-1111111111',
    80,
    'one@example.com',
  );
  vi.mocked(programmaticPayout).mockResolvedValue({
    data: { paymentId: 'payment' },
  } as any);
  vi.mocked(waitForPayoutResult).mockResolvedValue({
    data: { status: 'FAILED' },
  } as any);
  await Promise.all([processPayout(payout), processPayout(payout)]);
  expect((await Accounts.findById('venue')).balanceSats).toBe(100);
  expect((await Payouts.findOne()).state).toBe('failed');
});
it('keeps an uncertain withdrawal reserved for safe retry', async () => {
  await Accounts.updateOne({ _id: 'venue' }, { $set: { balanceSats: 100 } });
  const payout = await reservePayout(
    'venue',
    'request-1111111111',
    80,
    'one@example.com',
  );
  vi.mocked(programmaticPayout).mockResolvedValue({
    error: { message: 'timeout' },
  } as any);
  await expect(processPayout(payout)).rejects.toMatchObject({ status: 503 });
  expect((await Accounts.findById('venue')).balanceSats).toBe(20);
  expect((await Payouts.findOne()).requestKey).toBe('venue:request-1111111111');
});
it('keeps an unknown provider payout status pending without a refund or second payment', async () => {
  await Accounts.updateOne({ _id: 'venue' }, { $set: { balanceSats: 100 } });
  const payout = await reservePayout(
    'venue',
    'request-1111111111',
    80,
    'one@example.com',
  );
  vi.mocked(programmaticPayout)
    .mockClear()
    .mockResolvedValue({ data: { paymentId: 'payment' } } as any);
  vi.mocked(waitForPayoutResult).mockResolvedValue({
    data: { status: 'UNKNOWN' },
  } as any);
  const pending = await processPayout(payout);
  await processPayout(pending);
  expect(programmaticPayout).toHaveBeenCalledOnce();
  expect((await Accounts.findById('venue')).balanceSats).toBe(20);
  expect((await Payouts.findOne()).state).toBe('pending');
  expect((await Payouts.findOne()).completedAt).toBeUndefined();
});

vi.mock('../../lib/mdk-checkout', () => ({ createDurableCheckout: vi.fn() }));
vi.mock('@moneydevkit/core', () => ({
  listProducts: vi.fn(),
  getCheckout: vi.fn(),
  createMoneyDevKitClient: vi.fn(),
}));
vi.mock('../../lib/mdk-subscriptions', () => ({
  syncMdkSubscriptions: vi.fn(),
}));
import { createDurableCheckout } from '../../lib/mdk-checkout';
import {
  listProducts,
  getCheckout,
  createMoneyDevKitClient,
} from '@moneydevkit/core';
import {
  createSubscriptionCheckout,
  reconcileBilling,
} from '../../lib/billing';
import Billing from '../../models/BillingCheckout';
it('creates only one pending plan checkout per host under concurrency', async () => {
  await Subscriptions.deleteMany({});
  await Billing.deleteMany({});
  await Hosts.deleteMany({});
  await Hosts.create({
    hostId: 'venue',
    spotifyId: 'venue',
    shortName: 'venue',
  });
  process.env.MDK_PRO_PRODUCT_ID = 'product';
  vi.mocked(listProducts).mockResolvedValue([
    {
      id: 'product',
      recurringInterval: 'MONTH',
      prices: [{ currency: 'USD', priceAmount: 2000 }],
    },
  ] as any);
  vi.mocked(createDurableCheckout).mockImplementation(async (_fields, save) => {
    await save('billing-checkout');
    return {
      id: 'billing-checkout',
      currency: 'USD',
      totalAmount: 2000,
    } as any;
  });
  await Promise.all(
    [1, 2, 3].map(i =>
      createSubscriptionCheckout(
        'venue',
        'fixture@example.invalid',
        'pro',
        `request-111111111${i}`,
      ),
    ),
  );
  expect(await Billing.countDocuments()).toBe(1);
  expect(createDurableCheckout).toHaveBeenCalledOnce();
});
it('does not strand an order when product configuration is wrong', async () => {
  await Subscriptions.deleteMany({});
  await Billing.deleteMany({});
  process.env.MDK_PRO_PRODUCT_ID = 'product';
  vi.mocked(listProducts).mockResolvedValue([]);
  await expect(
    createSubscriptionCheckout(
      'venue',
      'fixture@example.invalid',
      'pro',
      'request-1111111111',
    ),
  ).rejects.toMatchObject({ status: 503 });
  expect(await Billing.countDocuments()).toBe(0);
});
it('keeps a paid checkout pending until its subscription exists', async () => {
  await Subscriptions.deleteMany({});
  await Billing.deleteMany({});
  await Billing.create({
    requestKey: 'billing-key',
    checkoutId: 'billing-checkout',
    hostId: 'venue',
    planId: 'pro',
    state: 'pending',
  });
  vi.mocked(getCheckout).mockResolvedValue({
    status: 'PAYMENT_RECEIVED',
    currency: 'USD',
    totalAmount: 2000,
    userMetadata: { billingRequestKey: 'billing-key' },
  } as any);
  await expect(reconcileBilling('billing-checkout')).rejects.toThrow(
    'waiting for subscription',
  );
  expect((await Billing.findOne()).state).toBe('pending');
});
it('rejects a plan payment with the wrong recorded price', async () => {
  await Billing.deleteMany({});
  await Billing.create({
    requestKey: 'billing-key',
    checkoutId: 'billing-checkout',
    hostId: 'venue',
    planId: 'pro',
    state: 'pending',
  });
  vi.mocked(getCheckout).mockResolvedValue({
    status: 'PAYMENT_RECEIVED',
    currency: 'USD',
    totalAmount: 1,
    userMetadata: { billingRequestKey: 'billing-key' },
  } as any);
  await expect(reconcileBilling('billing-checkout')).rejects.toMatchObject({
    status: 409,
  });
  expect((await Billing.findOne()).state).toBe('pending');
});
it('rejects a confirmed sandbox subscription before minting an invoice', async () => {
  await Billing.deleteMany({});
  await Billing.create({
    requestKey: 'billing-key',
    checkoutId: 'billing-checkout',
    hostId: 'venue',
    planId: 'pro',
    state: 'pending',
  });
  vi.mocked(getCheckout).mockResolvedValue({
    sandbox: true,
    status: 'CONFIRMED',
  } as any);
  vi.mocked(createMoneyDevKitClient).mockClear();
  await expect(reconcileBilling('billing-checkout')).rejects.toMatchObject({
    status: 409,
  });
  expect(createMoneyDevKitClient).not.toHaveBeenCalled();
  expect((await Billing.findOne()).state).toBe('pending');
});

vi.mock('../../lib/auth', () => ({
  requireHostSession: async () => ({ user: { id: 'venue' } }),
}));
import deleteHost from '../../pages/api/host-account';
import Domains from '../../models/CustomDomain';
it('deletes a zero-balance host and queue while retaining settled financial records', async () => {
  await Subscriptions.deleteMany({});
  await Billing.deleteMany({});
  await Domains.deleteMany({});
  await Hosts.deleteMany({});
  await Hosts.create({
    hostId: 'venue',
    spotifyId: 'venue',
    shortName: 'venue',
    spotifyRefreshToken: 'fixture-token',
  });
  await Orders.updateMany({}, { $set: { state: 'fulfilled' } });
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  };
  await deleteHost(
    { method: 'DELETE', body: { confirmation: 'venue' } } as any,
    res as any,
  );
  const host = await Hosts.findOne({ hostId: 'venue' }).select(
    '+spotifyRefreshToken',
  );
  expect(host.deletedAt).toBeTruthy();
  expect(host.spotifyRefreshToken).toBeUndefined();
  expect(host.shortName).toBeUndefined();
  expect(await Orders.countDocuments()).toBe(1);
  expect(await Plays.countDocuments()).toBe(0);
});
it('refuses deletion while a payment is pending', async () => {
  await Subscriptions.deleteMany({});
  await Billing.deleteMany({});
  await Domains.deleteMany({});
  await Hosts.deleteMany({});
  await Hosts.create({
    hostId: 'venue',
    spotifyId: 'venue',
    shortName: 'venue',
  });
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  };
  await deleteHost(
    { method: 'DELETE', body: { confirmation: 'venue' } } as any,
    res as any,
  );
  expect(res.status).toHaveBeenCalledWith(409);
  expect((await Hosts.findOne({ hostId: 'venue' })).deletedAt).toBeNull();
});
