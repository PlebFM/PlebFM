import { checkLnbitsInvoice, getLnbitsInvoice } from '../lnbits';
import { CreatedInvoice, InvoiceStatus, PaymentProvider } from './types';

/**
 * LNbits provider. Wraps the existing `lib/lnbits.ts` calls so behaviour is
 * unchanged from before the provider abstraction existed — LNbits looks up
 * status by payment hash, so `statusRef` is the payment hash.
 */
export const lnbitsProvider: PaymentProvider = {
  name: 'lnbits',

  async createInvoice(
    memo: string,
    amountSats: number,
  ): Promise<CreatedInvoice> {
    const data = (await getLnbitsInvoice(memo, amountSats)) as {
      payment_request?: string;
      payment_hash?: string;
    };

    // The old handler passed LNbits' response straight through, so a failed
    // mint surfaced in the browser as `undefined` fields. Fail loudly instead.
    if (!data?.payment_request || !data?.payment_hash) {
      throw new Error('LNbits did not return an invoice');
    }

    return {
      paymentRequest: data.payment_request,
      paymentHash: data.payment_hash,
      statusRef: data.payment_hash,
    };
  },

  async checkInvoice(statusRef: string): Promise<InvoiceStatus> {
    const data = (await checkLnbitsInvoice(statusRef)) as { paid?: boolean };
    return { settled: data?.paid === true };
  },
};
