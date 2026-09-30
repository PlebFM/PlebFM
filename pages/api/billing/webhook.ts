import { syncStripeSubscription } from '../../../lib/stripe-subscriptions';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import {
  rawBody,
  sendError,
  methodNotAllowed,
  HttpError,
} from '../../../lib/http';
import { ensureDB } from '../../../lib/db';
import Subscriptions from '../../../models/HostSubscription';
import Receipts from '../../../models/BillingReceipt';
export const config = { api: { bodyParser: false } };
// Kept for existing Stripe subscribers during the MDK transition. New checkouts use MDK.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
      throw new HttpError(503, 'Stripe webhook is not configured');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        await rawBody(req),
        req.headers['stripe-signature']!,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw new HttpError(400, 'Invalid webhook signature');
    }
    await ensureDB();
    let id: string | undefined;
    if (event.type.startsWith('customer.subscription.'))
      id = (event.data.object as Stripe.Subscription).id;
    if (event.type.startsWith('invoice.')) {
      const invoice = event.data.object as Stripe.Invoice;
      id =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
    }
    if (event.type === 'checkout.session.completed') {
      const checkout = event.data.object as Stripe.Checkout.Session;
      id =
        typeof checkout.subscription === 'string'
          ? checkout.subscription
          : checkout.subscription?.id;
    }
    if (id) {
      const { hostId, planId } = await syncStripeSubscription(stripe, id);
      if (event.type === 'invoice.paid') {
        const invoice = event.data.object as Stripe.Invoice;
        await Receipts.updateOne(
          { receiptId: `stripe:${invoice.id}` },
          {
            $setOnInsert: {
              hostId,
              provider: 'stripe',
              planId,
              amount: invoice.amount_paid,
              currency: invoice.currency.toUpperCase(),
              paidAt: new Date(
                (invoice.status_transitions.paid_at || invoice.created) * 1000,
              ),
            },
          },
          { upsert: true },
        );
      }
    }
    return res.json({ received: true });
  } catch (e) {
    return sendError(res, e);
  }
}
