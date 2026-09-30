import { decodeInvoiceRef, InvoiceRef } from './token';
import { PaymentProvider } from './types';

/**
 * A bare LNbits payment hash: sha256, so exactly 64 hex characters.
 *
 * Only this shape may take the legacy path. Anything else that fails token
 * verification — a tampered token, an unknown version, an expired token,
 * malformed claims — is rejected rather than quietly handed to LNbits as if it
 * were a payment hash.
 */
const LEGACY_PAYMENT_HASH = /^[0-9a-f]{64}$/i;

export class InvalidInvoiceRefError extends Error {
  constructor() {
    super('Invalid or expired invoice reference');
    this.name = 'InvalidInvoiceRefError';
  }
}

export class PaymentHashMismatchError extends Error {
  constructor(signed: string, observed: string) {
    super(
      `Invoice reference payment hash ${signed} does not match provider-observed ${observed}`,
    );
    this.name = 'PaymentHashMismatchError';
  }
}

/**
 * Work out which invoice the client is asking about.
 *
 * `hash` and `ref` are both untrusted carriers. Newer clients send the signed
 * reference in both; clients that predate `status_ref` send it only in `hash`;
 * invoices minted before this existed have a bare LNbits payment hash in `hash`.
 *
 * Fails closed: a token-shaped value that does not verify is an error, never a
 * fallback.
 */
export const resolveInvoiceRef = (
  hashParam: string,
  refParam?: string | null,
): InvoiceRef => {
  const fromRef = refParam ? decodeInvoiceRef(refParam) : null;
  if (fromRef) return fromRef;

  const fromHash = decodeInvoiceRef(hashParam);
  if (fromHash) return fromHash;

  // Neither carrier verified. Only an unmistakable legacy payment hash is
  // allowed through, and only for LNbits, which looks up *by* payment hash — so
  // settlement and bid identity stay bound for those invoices too.
  const candidate = refParam && !hashParam ? refParam : hashParam;
  if (LEGACY_PAYMENT_HASH.test(candidate)) {
    return {
      provider: 'lnbits',
      statusRef: candidate,
      paymentHash: candidate,
    };
  }

  throw new InvalidInvoiceRefError();
};

export type SettlementResult = {
  settled: boolean;
  /** Payment hash to record as `Bid.rHash`. Provider-observed, never client-supplied. */
  paymentHash: string;
  /** Provider says the invoice is dead. Terminal — the client must stop polling. */
  expired: boolean;
};

/**
 * Settle an invoice through the provider that minted it.
 *
 * Uses the provider named in the reference rather than the currently configured
 * one, so flipping `PAYMENT_PROVIDER` cannot strand an invoice already in flight.
 *
 * Cross-checks the provider-observed payment hash against the signed one. The
 * signed value is otherwise carried and never used; comparing them means a token
 * cannot be pointed at a checkout it was not minted for.
 *
 * `resolveProvider` is injected rather than imported so this module stays free
 * of the provider implementations — which pull in the Money Dev Kit SDK — and
 * can be tested without them.
 */
export const settleInvoice = async (
  ref: InvoiceRef,
  resolveProvider: (name: string) => PaymentProvider,
): Promise<SettlementResult> => {
  const provider = resolveProvider(ref.provider);
  const { settled, paymentHash, expired } = await provider.checkInvoice(
    ref.statusRef,
  );

  if (settled && paymentHash !== ref.paymentHash) {
    throw new PaymentHashMismatchError(ref.paymentHash, paymentHash);
  }

  return { settled, paymentHash, expired: expired === true };
};
