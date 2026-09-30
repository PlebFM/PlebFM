import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
}));
vi.mock('@moneydevkit/core', () => ({ getCheckout: mocks.get }));
vi.mock('../../models/PaymentOrder', () => ({
  default: { findOne: mocks.find, updateOne: mocks.update },
}));
vi.mock('../../models/BillingCheckout', () => ({
  default: { findOne: mocks.find, updateOne: mocks.update },
}));
import { recoverCheckout } from '../recover-checkout';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.find.mockResolvedValue({
    _id: 'record',
    orderId: 'order',
    provider: 'mdk',
    amountSats: 10,
  });
  mocks.get.mockResolvedValue({
    id: 'checkout',
    currency: 'SAT',
    totalAmount: 10,
    userMetadata: { bidOrderId: 'order' },
  });
});
it('attaches a lost provider reference only after matching saved intent', async () => {
  await recoverCheckout({ checkoutId: 'checkout', orderId: 'order' });
  expect(mocks.update).toHaveBeenCalledWith(
    expect.objectContaining({ _id: 'record' }),
    { $set: { statusRef: 'checkout' } },
  );
});
it('rejects recovery against another order, amount or sandbox', async () => {
  for (const change of [
    { totalAmount: 1 },
    { sandbox: true },
    { userMetadata: { bidOrderId: 'other' } },
  ]) {
    mocks.get.mockResolvedValue({
      id: 'checkout',
      currency: 'SAT',
      totalAmount: 10,
      userMetadata: { bidOrderId: 'order' },
      ...change,
    });
    await expect(
      recoverCheckout({ checkoutId: 'checkout', orderId: 'order' }),
    ).rejects.toMatchObject({ status: 409 });
  }
  expect(mocks.update).not.toHaveBeenCalled();
});
it('will not replace an already bound provider identity', async () => {
  mocks.find.mockResolvedValue({
    _id: 'record',
    orderId: 'order',
    amountSats: 10,
    statusRef: 'original',
  });
  await expect(
    recoverCheckout({ checkoutId: 'checkout', orderId: 'order' }),
  ).rejects.toMatchObject({ status: 409 });
  expect(mocks.update).not.toHaveBeenCalled();
});
