import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  mint: vi.fn(),
  get: vi.fn(),
  preview: vi.fn(),
}));
vi.mock('@moneydevkit/core', () => ({
  createMoneyDevKitClient: () => ({
    checkouts: { create: mocks.create, mintInvoice: mocks.mint },
  }),
  deriveNodeIdFromConfig: () => 'node',
  is_preview_environment: mocks.preview,
  getCheckout: mocks.get,
}));
import { createDurableCheckout } from '../mdk-checkout';
import { mdkProvider, recoverMdkInvoice } from '../payments/mdk';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.preview.mockReturnValue(false);
  mocks.create.mockResolvedValue({ id: 'checkout', status: 'CONFIRMED' });
  mocks.mint.mockResolvedValue({
    id: 'checkout',
    status: 'PENDING_PAYMENT',
    invoice: { invoice: 'bolt11', paymentHash: 'hash' },
  });
});
it('saves the provider identity before minting a payable invoice', async () => {
  const save = vi.fn(async () => {
    expect(mocks.mint).not.toHaveBeenCalled();
  });
  await createDurableCheckout({ amount: 10, currency: 'SAT' }, save);
  expect(save).toHaveBeenCalledWith('checkout');
  expect(mocks.mint).toHaveBeenCalledWith({ checkoutId: 'checkout' });
});
it('does not mint when saving the provider identity fails', async () => {
  await expect(
    createDurableCheckout({ amount: 10, currency: 'SAT' }, async () => {
      throw Error('database unavailable');
    }),
  ).rejects.toThrow('database');
  expect(mocks.mint).not.toHaveBeenCalled();
});
it('recovers the original checkout after an interrupted mint', async () => {
  mocks.get.mockResolvedValue({
    id: 'checkout',
    status: 'CONFIRMED',
    currency: 'SAT',
    totalAmount: 10,
    userMetadata: { bidOrderId: 'order' },
  });
  await expect(
    recoverMdkInvoice('checkout', 'order', 10),
  ).resolves.toMatchObject({ statusRef: 'checkout', paymentHash: 'hash' });
  expect(mocks.create).not.toHaveBeenCalled();
});
it('never recovers a checkout belonging to another order', async () => {
  mocks.get.mockResolvedValue({
    currency: 'SAT',
    totalAmount: 10,
    userMetadata: { bidOrderId: 'other' },
  });
  await expect(recoverMdkInvoice('checkout', 'order', 10)).rejects.toThrow(
    'match',
  );
  expect(mocks.mint).not.toHaveBeenCalled();
});
it('refuses sandbox creation and settlement', async () => {
  mocks.preview.mockReturnValue(true);
  await expect(
    createDurableCheckout({ amount: 10, currency: 'SAT' }, async () => {}),
  ).rejects.toThrow('Sandbox');
  expect(mocks.create).not.toHaveBeenCalled();
  mocks.get.mockResolvedValue({ sandbox: true, status: 'PAYMENT_RECEIVED' });
  await expect(mdkProvider.checkInvoice('checkout')).rejects.toThrow('Sandbox');
});
it('returns authoritative received sats and net settlement', async () => {
  mocks.get.mockResolvedValue({
    status: 'PAYMENT_RECEIVED',
    currency: 'SAT',
    netAmount: 9,
    invoice: { paymentHash: 'hash', amountSats: 10, amountSatsReceived: 10 },
  });
  await expect(mdkProvider.checkInvoice('checkout')).resolves.toMatchObject({
    settled: true,
    amountSats: 10,
    netAmountSats: 9,
    currency: 'SAT',
    paymentHash: 'hash',
  });
});
