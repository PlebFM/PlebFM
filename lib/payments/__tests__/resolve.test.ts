import { beforeEach, describe, expect, it } from 'vitest';
import {
  InvalidInvoiceRefError,
  PaymentHashMismatchError,
  resolveInvoiceRef,
  settleInvoice,
} from '../resolve';
import { encodeInvoiceRef } from '../token';
import { PaymentProvider } from '../types';

const HASH_A = 'a'.repeat(64); // legacy-shaped LNbits payment hash
const HASH_B = 'b'.repeat(64);

/** Stub backends, so nothing here talks to LNbits or mdk.com. */
const stubProvider = (
  name: 'lnbits' | 'mdk',
  checkouts: Record<string, { settled: boolean; paymentHash: string }>,
): PaymentProvider => ({
  name,
  async createInvoice() {
    throw new Error('not used in these tests');
  },
  async checkInvoice(statusRef: string) {
    const found = checkouts[statusRef];
    if (!found) throw new Error(`no such invoice ${statusRef}`);
    return found;
  },
});

const providers: Record<string, PaymentProvider> = {
  mdk: stubProvider('mdk', {
    checkout_123: { settled: true, paymentHash: HASH_A },
    checkout_unpaid: { settled: false, paymentHash: HASH_B },
    checkout_swapped: { settled: true, paymentHash: HASH_B },
  }),
  lnbits: stubProvider('lnbits', {
    [HASH_A]: { settled: true, paymentHash: HASH_A },
    [HASH_B]: { settled: false, paymentHash: HASH_B },
  }),
};
const resolveProvider = (name: string) => providers[name];

const settle = (hash: string, ref?: string | null) =>
  settleInvoice(resolveInvoiceRef(hash, ref), resolveProvider);

describe('invoice reference resolution', () => {
  beforeEach(() => {
    process.env.INVOICE_TOKEN_SECRET = 'test_secret';
    delete process.env.INVOICE_TOKEN_SECRET_PREVIOUS;
  });

  const mdkToken = () =>
    encodeInvoiceRef({
      provider: 'mdk',
      statusRef: 'checkout_123',
      paymentHash: HASH_A,
    });

  describe('replay: one payment, forged hashes (PR #111 finding 1)', () => {
    it('records the provider-observed hash, not the client-supplied one', async () => {
      const token = mdkToken();
      const first = await settle('FORGED_HASH_1', token);
      const second = await settle('FORGED_HASH_2', token);

      expect(first.settled).toBe(true);
      expect(first.paymentHash).toBe(HASH_A);
      expect(second.paymentHash).toBe(HASH_A);
      // Both forged attempts collapse to one identity, so submitBid's rHash
      // dedupe sees a repeat instead of a new bid.
      expect(first.paymentHash).toBe(second.paymentHash);
    });

    it('rejects a token pointing at a checkout it was not minted for', async () => {
      const mismatched = encodeInvoiceRef({
        provider: 'mdk',
        statusRef: 'checkout_swapped', // settles, but with HASH_B
        paymentHash: HASH_A, // token claims HASH_A
      });
      await expect(settle(HASH_A, mismatched)).rejects.toBeInstanceOf(
        PaymentHashMismatchError,
      );
    });
  });

  describe('legacy hash-only client (PR #111 finding 2)', () => {
    it('resolves an MDK invoice when the token arrives only as `hash`', async () => {
      const result = await settle(mdkToken(), undefined);
      expect(result.settled).toBe(true);
      expect(result.paymentHash).toBe(HASH_A);
    });
  });

  describe('provider cutover (PR #111 finding 3)', () => {
    it('settles via the minting provider regardless of PAYMENT_PROVIDER', async () => {
      const lnbitsToken = encodeInvoiceRef({
        provider: 'lnbits',
        statusRef: HASH_A,
        paymentHash: HASH_A,
      });
      process.env.PAYMENT_PROVIDER = 'mdk'; // cutover happened mid-flight
      const result = await settle(HASH_A, lnbitsToken);
      expect(result.settled).toBe(true);
      expect(result.paymentHash).toBe(HASH_A);
      delete process.env.PAYMENT_PROVIDER;
    });
  });

  describe('fail closed', () => {
    it('rejects a token-shaped value with a bad signature instead of falling back', () => {
      const token = mdkToken();
      const tampered = `${token.split('.')[0]}.${'x'.repeat(43)}`;
      expect(() => resolveInvoiceRef(tampered, null)).toThrow(
        InvalidInvoiceRefError,
      );
    });

    it('rejects an expired token rather than treating it as a payment hash', () => {
      process.env.INVOICE_TOKEN_SECRET = 'test_secret';
      const stale = encodeInvoiceRef(
        { provider: 'mdk', statusRef: 'checkout_123', paymentHash: HASH_A },
        1_000,
      );
      expect(() => resolveInvoiceRef(stale, null)).toThrow(
        InvalidInvoiceRefError,
      );
    });

    it('rejects junk that is not a token and not a payment hash', () => {
      for (const value of ['nonsense', 'zz', 'a'.repeat(63), 'g'.repeat(64)]) {
        expect(() => resolveInvoiceRef(value, null)).toThrow(
          InvalidInvoiceRefError,
        );
      }
    });

    it('does not route an unverifiable value to a non-LNbits backend', () => {
      // The only permitted fallback is LNbits, which looks up by payment hash.
      expect(resolveInvoiceRef(HASH_A, null).provider).toBe('lnbits');
    });
  });

  describe('legacy bare LNbits payment hash', () => {
    it('settles invoices minted before tokens existed', async () => {
      const result = await settle(HASH_A, null);
      expect(result.settled).toBe(true);
      expect(result.paymentHash).toBe(HASH_A);
    });

    it('reports unpaid invoices as unsettled', async () => {
      expect((await settle(HASH_B, null)).settled).toBe(false);
    });
  });

  it('does not cross-check the hash while an invoice is still unpaid', async () => {
    // checkout_unpaid reports HASH_B; the token claims HASH_A. Unsettled
    // invoices must simply report false rather than erroring.
    const token = encodeInvoiceRef({
      provider: 'mdk',
      statusRef: 'checkout_unpaid',
      paymentHash: HASH_A,
    });
    expect((await settle(HASH_A, token)).settled).toBe(false);
  });
});
