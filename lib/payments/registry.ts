import { lnbitsProvider } from './lnbits';
import { mdkProvider } from './mdk';
import { PaymentProvider } from './types';

const PROVIDERS: Record<string, PaymentProvider> = {
  lnbits: lnbitsProvider,
  mdk: mdkProvider,
};

/** Look up a provider by name. Used to settle an invoice through whichever
 *  backend actually minted it, rather than whatever is configured right now. */
export const getProviderByName = (name: string): PaymentProvider => {
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(
      `Unknown payment provider "${name}" (expected "lnbits" or "mdk")`,
    );
  }
  return provider;
};

/**
 * Selects the Lightning backend for *new* invoices from `PAYMENT_PROVIDER`.
 *
 * Defaults to `lnbits` so an existing deployment that has not set the variable
 * keeps its current behaviour untouched. Set `PAYMENT_PROVIDER=mdk` to route
 * bids through Money Dev Kit.
 *
 * Only mint with this. Settlement goes through `settleInvoice`, which routes by
 * the provider recorded in the invoice's signed reference — otherwise flipping
 * this variable strands invoices that are already in flight.
 */
export const getPaymentProvider = (): PaymentProvider =>
  getProviderByName(
    (process.env.PAYMENT_PROVIDER ?? 'lnbits').trim().toLowerCase(),
  );
