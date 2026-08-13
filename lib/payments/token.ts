import crypto from 'crypto';

/**
 * Signed invoice reference.
 *
 * The browser polls `/api/invoice` with values it could trivially forge, so the
 * server must not read the provider, the status lookup key, or the payment hash
 * straight off the query string. It reads them out of this token instead, which
 * is HMAC-signed and therefore authoritative.
 *
 * This is what binds settlement to bid identity: without it, a client can settle
 * against one paid checkout (`ref`) while submitting a different, unpaid
 * `hash` as the bid's dedupe key, and mint bids from a single payment.
 *
 * The token is not a secret — it identifies a payment, it does not authorise
 * one — so it is safe in a query string. It is also not single-use: stateless
 * signing cannot express consumption. One-payment-one-bid needs a persisted
 * invoice record; see `submitBid`, which only dedupes within an existing play.
 */

export type InvoiceRef = {
  /** Which backend minted this invoice. Read from here, never from env, so a
   *  provider cutover cannot re-route an in-flight invoice to the wrong node. */
  provider: 'lnbits' | 'mdk';
  /** Provider's own status lookup key: payment hash for LNbits, checkout id for MDK. */
  statusRef: string;
  /** Payment hash observed at mint time. */
  paymentHash: string;
};

const b64url = (b: Buffer) => b.toString('base64url');

const secret = (): string => {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) {
    throw new Error('NEXTAUTH_SECRET is required to sign invoice references');
  }
  return value;
};

const sign = (payload: string): string =>
  b64url(crypto.createHmac('sha256', secret()).update(payload).digest());

/** Encode an invoice reference as `<payload>.<signature>`. */
export const encodeInvoiceRef = (ref: InvoiceRef): string => {
  const payload = b64url(Buffer.from(JSON.stringify(ref), 'utf8'));
  return `${payload}.${sign(payload)}`;
};

/**
 * Decode and verify a token.
 *
 * Returns null for anything that is not a valid, correctly signed token —
 * including a bare LNbits payment hash from a client that predates tokens, which
 * the caller handles as the legacy case.
 */
export const decodeInvoiceRef = (value: string): InvoiceRef | null => {
  const parts = value.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  // Length check first: timingSafeEqual throws on a length mismatch.
  if (given.length !== want.length) return null;
  if (!crypto.timingSafeEqual(given, want)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    );
    if (
      (parsed?.provider !== 'lnbits' && parsed?.provider !== 'mdk') ||
      typeof parsed?.statusRef !== 'string' ||
      typeof parsed?.paymentHash !== 'string'
    ) {
      return null;
    }
    return {
      provider: parsed.provider,
      statusRef: parsed.statusRef,
      paymentHash: parsed.paymentHash,
    };
  } catch {
    return null;
  }
};
