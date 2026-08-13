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
 * against one paid checkout (`ref`) while submitting a different, unpaid `hash`
 * as the bid's dedupe key, and mint bids from a single payment.
 *
 * Security properties this token does NOT have, stated plainly so nobody builds
 * on assumptions it does not hold:
 *
 * - **It is not single-use.** Stateless signing cannot express consumption.
 *   `submitBid` only dedupes within an existing play, so one payment can still
 *   fund bids on different songs. Closing that needs a persisted invoice record.
 * - **After settlement it is effectively a bearer credential.** Whoever holds it
 *   can submit a bid, and `hostId` / `songId` / `bidAmount` are still taken from
 *   the query string, so the holder chooses what they are bidding on and how
 *   much. Signing purchase intent into the token would fix that, but clients
 *   that predate this do not send `songId` at mint time, so it needs its own
 *   change. Treat the token as sensitive in logs and referrers.
 */

/** Bumped when the payload shape changes. Unknown versions are rejected. */
const TOKEN_VERSION = 1;

/**
 * Token lifetime. Deliberately >= the old LNbits `expiry: 3600`, so the token
 * never dies before the invoice it points at and strands a slow payer.
 */
const TOKEN_TTL_SECONDS = 3600;

export type InvoiceRef = {
  /** Which backend minted this invoice. Read from here, never from env, so a
   *  provider cutover cannot re-route an in-flight invoice to the wrong node. */
  provider: 'lnbits' | 'mdk';
  /** Provider's own status lookup key: payment hash for LNbits, checkout id for MDK. */
  statusRef: string;
  /** Payment hash observed at mint time. Cross-checked against the provider at
   *  settlement, so a token cannot point at a checkout it was not minted for. */
  paymentHash: string;
};

type TokenPayload = InvoiceRef & { v: number; exp: number };

const b64url = (b: Buffer) => b.toString('base64url');

/**
 * Signing secret, and any additional secrets still accepted for verification.
 *
 * `INVOICE_TOKEN_SECRET` keeps invoice validity decoupled from session auth:
 * rotating `NEXTAUTH_SECRET` should not strand every in-flight invoice. It falls
 * back to `NEXTAUTH_SECRET` so existing deployments keep working without a new
 * required variable.
 *
 * To rotate without stranding invoices: move the current value into
 * `INVOICE_TOKEN_SECRET_PREVIOUS`, set the new one in `INVOICE_TOKEN_SECRET`,
 * and drop the previous value after `TOKEN_TTL_SECONDS` has elapsed.
 */
const signingSecret = (): string => {
  const value = process.env.INVOICE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) {
    throw new Error(
      'INVOICE_TOKEN_SECRET (or NEXTAUTH_SECRET) is required to sign invoice references',
    );
  }
  return value;
};

const verificationSecrets = (): string[] =>
  [
    process.env.INVOICE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET,
    process.env.INVOICE_TOKEN_SECRET_PREVIOUS,
  ].filter((s): s is string => Boolean(s));

const sign = (payload: string, secret: string): string =>
  b64url(crypto.createHmac('sha256', secret).update(payload).digest());

const matches = (given: string, expected: string): boolean => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // Length check first: timingSafeEqual throws on a length mismatch.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

/** Encode an invoice reference as `<payload>.<signature>`. */
export const encodeInvoiceRef = (
  ref: InvoiceRef,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string => {
  const payload: TokenPayload = {
    ...ref,
    v: TOKEN_VERSION,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
  };
  const encoded = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  return `${encoded}.${sign(encoded, signingSecret())}`;
};

/**
 * Decode and verify a token.
 *
 * Returns null for anything that is not a currently valid token: wrong shape,
 * bad signature, unknown version, malformed claims, or expired. Callers must
 * treat null as a rejection, not as an invitation to guess — see
 * `resolveInvoiceRef`, which only falls back to the legacy path for values that
 * are unmistakably bare LNbits payment hashes.
 */
export const decodeInvoiceRef = (
  value: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): InvoiceRef | null => {
  const parts = value.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const signedByAny = verificationSecrets().some(secret =>
    matches(signature, sign(encoded, secret)),
  );
  if (!signedByAny) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    );
    if (parsed?.v !== TOKEN_VERSION) return null;
    if (typeof parsed?.exp !== 'number' || parsed.exp <= nowSeconds)
      return null;
    if (parsed?.provider !== 'lnbits' && parsed?.provider !== 'mdk')
      return null;
    if (typeof parsed?.statusRef !== 'string' || !parsed.statusRef) return null;
    if (typeof parsed?.paymentHash !== 'string' || !parsed.paymentHash) {
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
