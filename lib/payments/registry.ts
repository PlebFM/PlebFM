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

/** New bids default to MDK. Settlement always uses the provider saved on the order. */
export const getPaymentProvider = (): PaymentProvider =>
  getProviderByName(
    (process.env.PAYMENT_PROVIDER ?? 'mdk').trim().toLowerCase(),
  );
