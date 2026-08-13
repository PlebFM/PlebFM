import { createCheckout, getCheckout } from '@moneydevkit/core';
import { CreatedInvoice, InvoiceStatus, PaymentProvider } from './types';

/**
 * Checkout statuses that mean "the sats arrived".
 *
 * The typed contract (`CheckoutStatusSchema`) exposes UNCONFIRMED, CONFIRMED,
 * PENDING_PAYMENT, PAYMENT_RECEIVED and EXPIRED. The documented
 * `checkout.completed` webhook payload instead reports `status: "COMPLETED"`,
 * which is absent from that enum, so COMPLETED is matched here defensively
 * against the widened string rather than the union.
 */
const SETTLED_STATUSES: ReadonlySet<string> = new Set([
  'PAYMENT_RECEIVED',
  'COMPLETED',
]);

/**
 * Money Dev Kit provider.
 *
 * Deliberately avoids the hosted checkout page (`createCheckoutUrl` /
 * `<Checkout />`): PlebFM renders its own QR inside a custom bid flow, so this
 * only needs the raw BOLT11 out of the checkout object.
 *
 * Note: status is read via `getCheckout`, which is server-authoritative through
 * mdk.com. Do NOT substitute `paymentHasBeenReceived()` — that reads an
 * in-process Set hung off `globalThis`, which is empty or stale across
 * serverless invocations.
 */
export const mdkProvider: PaymentProvider = {
  name: 'mdk',

  async createInvoice(
    memo: string,
    amountSats: number,
  ): Promise<CreatedInvoice> {
    const result = await createCheckout({
      type: 'AMOUNT',
      currency: 'SAT',
      amount: amountSats,
      // `title` labels the order in the MDK dashboard; `description` is what
      // flows through to the BOLT11 description tag, which is where LNbits'
      // `memo` used to land and is what the payer sees in their wallet.
      title: memo,
      description: memo,
    });

    if (result.error) {
      throw new Error(
        `Money Dev Kit checkout failed (${result.error.code}): ${result.error.message}`,
      );
    }

    const { checkout } = result.data;
    const invoice = checkout.invoice;

    if (!invoice?.invoice || !invoice.paymentHash) {
      throw new Error(
        `Money Dev Kit checkout ${checkout.id} has no invoice (status ${checkout.status})`,
      );
    }

    return {
      paymentRequest: invoice.invoice,
      paymentHash: invoice.paymentHash,
      statusRef: checkout.id,
    };
  },

  async checkInvoice(statusRef: string): Promise<InvoiceStatus> {
    const checkout = await getCheckout(statusRef);
    return { settled: SETTLED_STATUSES.has(checkout.status as string) };
  },
};
