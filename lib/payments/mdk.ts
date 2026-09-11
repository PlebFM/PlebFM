import { createDurableCheckout } from '../mdk-checkout';
import { getCheckout, createMoneyDevKitClient } from '@moneydevkit/core';
import { withDeadline } from './deadline';
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
 * Checkout status that means "this invoice will never be paid".
 *
 * Terminal, so the poller stops instead of asking about a dead checkout every
 * two seconds for as long as the tab stays open.
 */
const EXPIRED_STATUS = 'EXPIRED';

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
    metadata?: Record<string, string>,
    saveReference?: (id: string) => Promise<void>,
  ): Promise<CreatedInvoice> {
    const checkout = await createDurableCheckout(
      {
        currency: 'SAT',
        amount: amountSats,
        metadata: { title: memo, description: memo, ...metadata },
      },
      saveReference ?? (async () => {}),
    );
    if (checkout.sandbox)
      throw new Error('Sandbox invoices cannot fund jukebox bids');
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
    const checkout = await withDeadline('getCheckout', () =>
      getCheckout(statusRef),
    );
    if (checkout.sandbox)
      throw new Error('Sandbox invoices cannot fund jukebox bids');
    const settled = SETTLED_STATUSES.has(checkout.status as string);
    const paymentHash = checkout.invoice?.paymentHash;

    // A settled checkout with no payment hash would leave the bid with no
    // identity to dedupe on, so refuse rather than record an ambiguous bid.
    if (settled && !paymentHash) {
      throw new Error(
        `Money Dev Kit checkout ${statusRef} settled without a payment hash`,
      );
    }

    return {
      settled,
      currency: checkout.currency,
      amountSats:
        checkout.invoice?.amountSatsReceived ??
        checkout.invoice?.amountSats ??
        undefined,
      netAmountSats: checkout.netAmount ?? undefined,
      paymentHash: paymentHash ?? '',
      expired: !settled && (checkout.status as string) === EXPIRED_STATUS,
    };
  },
};

export async function recoverMdkInvoice(
  id: string,
  orderId: string,
  amountSats: number,
) {
  const client = createMoneyDevKitClient();
  let checkout = await withDeadline('recover checkout', () => getCheckout(id));
  if (
    checkout.sandbox ||
    checkout.userMetadata?.bidOrderId !== orderId ||
    checkout.currency !== 'SAT' ||
    checkout.totalAmount !== amountSats
  )
    throw new Error('Checkout does not match order');
  if (checkout.status === 'CONFIRMED')
    checkout = await withDeadline('resume invoice', () =>
      client.checkouts.mintInvoice({ checkoutId: id }),
    );
  if (!checkout.invoice?.paymentHash || !checkout.invoice.invoice) return null;
  return {
    statusRef: id,
    paymentHash: checkout.invoice.paymentHash,
    paymentRequest: checkout.invoice.invoice,
    mintState: 'ready',
  };
}
