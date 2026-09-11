import type { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from 'standardwebhooks';
import {
  rawBody,
  HttpError,
  sendError,
  methodNotAllowed,
} from '../../../lib/http';
import { ensureDB } from '../../../lib/db';
import Orders from '../../../models/PaymentOrder';
import Billing from '../../../models/BillingCheckout';
import Subscriptions from '../../../models/HostSubscription';
import { reconcileOrder } from '../../../lib/payments/orders';
import { reconcileBilling } from '../../../lib/billing';
import { syncMdkSubscriptions } from '../../../lib/mdk-subscriptions';
export const config = { api: { bodyParser: false }, maxDuration: 60 };
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    if (!process.env.MDK_WEBHOOK_SECRET)
      throw new HttpError(503, 'Webhook is not configured');
    let event: any;
    try {
      event = new Webhook(process.env.MDK_WEBHOOK_SECRET).verify(
        (await rawBody(req)).toString('utf8'),
        {
          'webhook-id': String(req.headers['webhook-id'] ?? ''),
          'webhook-timestamp': String(req.headers['webhook-timestamp'] ?? ''),
          'webhook-signature': String(req.headers['webhook-signature'] ?? ''),
        },
      );
    } catch {
      throw new HttpError(401, 'Invalid webhook signature');
    }
    await ensureDB();
    const data = event.data;
    if (event.type === 'checkout.completed') {
      const id = data?.metadata?.bidOrderId;
      const order =
        typeof id === 'string'
          ? await Orders.findOne({ orderId: id, provider: 'mdk' })
          : null;
      if (order) {
        if (!order.statusRef) {
          // A create request can time out after the provider accepted it.
          const checkoutId = data.checkoutId || data.id;
          if (typeof checkoutId !== 'string')
            throw new HttpError(
              503,
              'Checkout reference required for recovery',
            );
          const { getCheckout } = await import('@moneydevkit/core');
          const checkout = await getCheckout(checkoutId);
          if (
            checkout.sandbox ||
            checkout.userMetadata?.bidOrderId !== order.orderId ||
            checkout.currency !== 'SAT' ||
            checkout.invoice?.amountSats !== order.amountSats ||
            !checkout.invoice?.paymentHash
          )
            throw new HttpError(409, 'Checkout does not match the saved order');
          await Orders.updateOne(
            { orderId: order.orderId, statusRef: { $exists: false } },
            {
              $set: {
                statusRef: checkout.id,
                paymentHash: checkout.invoice.paymentHash,
                paymentRequest: checkout.invoice.invoice,
                mintState: 'ready',
              },
            },
          );
        }
        await reconcileOrder(order.orderId);
      }
      const key = data?.metadata?.billingRequestKey;
      const billing =
        typeof key === 'string'
          ? await Billing.findOne({ requestKey: key })
          : null;
      if (billing && !billing.checkoutId) {
        const id = data.checkoutId || data.id;
        if (typeof id !== 'string')
          throw new HttpError(503, 'Checkout reference required for recovery');
        const { getCheckout } = await import('@moneydevkit/core');
        const checkout = await getCheckout(id);
        if (
          checkout.sandbox ||
          checkout.userMetadata?.billingRequestKey !== billing.requestKey
        )
          throw new HttpError(409, 'Checkout does not match plan');
        billing.checkoutId = id;
        billing.state = 'pending';
        await billing.save();
      }
      if (billing?.checkoutId) await reconcileBilling(billing.checkoutId);
    } else if (
      typeof event.type === 'string' &&
      event.type.startsWith('subscription.')
    ) {
      const subscription =
        typeof data?.customerId === 'string'
          ? await Subscriptions.findOne({
              provider: 'mdk',
              customerId: data.customerId,
            })
          : null;
      if (subscription) await syncMdkSubscriptions(subscription.hostId);
      // First payment is reconciled through its persisted billing checkout.
    }
    return res.json({ received: true });
  } catch (error) {
    return sendError(res, error);
  }
}
