import { beforeEach, describe, expect, it } from 'vitest';
import { decodeInvoiceRef, encodeInvoiceRef, InvoiceRef } from '../token';

const REF: InvoiceRef = {
  provider: 'mdk',
  statusRef: 'checkout_123',
  paymentHash: 'realhash_abc',
};

describe('invoice reference token', () => {
  beforeEach(() => {
    process.env.INVOICE_TOKEN_SECRET = 'test_secret';
    delete process.env.INVOICE_TOKEN_SECRET_PREVIOUS;
    delete process.env.NEXTAUTH_SECRET;
  });

  it('round-trips provider, statusRef and paymentHash', () => {
    expect(decodeInvoiceRef(encodeInvoiceRef(REF))).toEqual(REF);
  });

  it('rejects a tampered payload carrying a valid signature', () => {
    const token = encodeInvoiceRef(REF);
    const forged = Buffer.from(
      JSON.stringify({ ...REF, paymentHash: 'ATTACKER_HASH', v: 1, exp: 1e10 }),
      'utf8',
    ).toString('base64url');
    expect(decodeInvoiceRef(`${forged}.${token.split('.')[1]}`)).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const token = encodeInvoiceRef(REF);
    process.env.INVOICE_TOKEN_SECRET = 'another_secret';
    expect(decodeInvoiceRef(token)).toBeNull();
  });

  it('rejects malformed and non-token values', () => {
    for (const value of [
      '',
      'not-a-token',
      'a.b.c',
      '.',
      'realhash_abc',
      'a'.repeat(64),
    ]) {
      expect(decodeInvoiceRef(value)).toBeNull();
    }
  });

  it('rejects an expired token', () => {
    const now = 1_000_000;
    const token = encodeInvoiceRef(REF, now);
    expect(decodeInvoiceRef(token, now + 60)).toEqual(REF);
    // TTL is 3600s
    expect(decodeInvoiceRef(token, now + 3601)).toBeNull();
  });

  it('rejects an unknown token version', () => {
    // A v99 payload signed with the current secret must still be refused.
    const crypto = require('crypto');
    const payload = Buffer.from(
      JSON.stringify({ ...REF, v: 99, exp: 1e10 }),
      'utf8',
    ).toString('base64url');
    const sig = crypto
      .createHmac('sha256', 'test_secret')
      .update(payload)
      .digest('base64url');
    expect(decodeInvoiceRef(`${payload}.${sig}`)).toBeNull();
  });

  it('rejects claims with a bogus provider or empty fields', () => {
    const crypto = require('crypto');
    const make = (claims: Record<string, unknown>) => {
      const payload = Buffer.from(
        JSON.stringify({ v: 1, exp: 1e10, ...claims }),
        'utf8',
      ).toString('base64url');
      const sig = crypto
        .createHmac('sha256', 'test_secret')
        .update(payload)
        .digest('base64url');
      return `${payload}.${sig}`;
    };
    expect(
      decodeInvoiceRef(
        make({ provider: 'btcpay', statusRef: 'a', paymentHash: 'b' }),
      ),
    ).toBeNull();
    expect(
      decodeInvoiceRef(
        make({ provider: 'mdk', statusRef: '', paymentHash: 'b' }),
      ),
    ).toBeNull();
    expect(
      decodeInvoiceRef(
        make({ provider: 'mdk', statusRef: 'a', paymentHash: '' }),
      ),
    ).toBeNull();
  });

  describe('secret rotation', () => {
    it('still verifies tokens signed with the previous secret', () => {
      const token = encodeInvoiceRef(REF);
      process.env.INVOICE_TOKEN_SECRET = 'new_secret';
      expect(decodeInvoiceRef(token)).toBeNull();
      process.env.INVOICE_TOKEN_SECRET_PREVIOUS = 'test_secret';
      expect(decodeInvoiceRef(token)).toEqual(REF);
    });

    it('falls back to NEXTAUTH_SECRET when no dedicated secret is set', () => {
      delete process.env.INVOICE_TOKEN_SECRET;
      process.env.NEXTAUTH_SECRET = 'session_secret';
      expect(decodeInvoiceRef(encodeInvoiceRef(REF))).toEqual(REF);
    });

    it('refuses to sign with no secret configured at all', () => {
      delete process.env.INVOICE_TOKEN_SECRET;
      delete process.env.NEXTAUTH_SECRET;
      expect(() => encodeInvoiceRef(REF)).toThrow(/required to sign/);
    });
  });
});
