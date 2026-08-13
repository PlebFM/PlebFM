import { lnbitsProvider } from './lnbits';
import { mdkProvider } from './mdk';
import { PaymentProvider } from './types';

export type { CreatedInvoice, InvoiceStatus, PaymentProvider } from './types';

/**
 * Selects the Lightning backend from `PAYMENT_PROVIDER`.
 *
 * Defaults to `lnbits` so an existing deployment that has not set the variable
 * keeps its current behaviour untouched. Set `PAYMENT_PROVIDER=mdk` to route
 * bids through Money Dev Kit.
 */
export const getPaymentProvider = (): PaymentProvider => {
  const configured = (process.env.PAYMENT_PROVIDER ?? 'lnbits')
    .trim()
    .toLowerCase();

  switch (configured) {
    case 'lnbits':
      return lnbitsProvider;
    case 'mdk':
      return mdkProvider;
    default:
      throw new Error(
        `Unknown PAYMENT_PROVIDER "${configured}" (expected "lnbits" or "mdk")`,
      );
  }
};
