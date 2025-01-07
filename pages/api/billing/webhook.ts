import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Disable body parsing, need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await Buffer.from(req.body);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return res
      .status(400)
      .json({ error: 'Webhook signature verification failed' });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        // Update subscription in your database
        await updateSubscription(subscription);
        break;
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        // Mark subscription as canceled in your database
        await cancelSubscription(deletedSubscription);
        break;
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        await handleFailedPayment(invoice);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Error handling webhook event:', err);
    return res.status(500).json({ error: 'Error handling webhook event' });
  }
}

async function updateSubscription(subscription: Stripe.Subscription) {
  // TODO: Update subscription in your database
  // const { metadata } = subscription;
  // const hostId = metadata.hostId;
  // const planId = metadata.planId;
  // Update host's subscription status
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  // TODO: Mark subscription as canceled in your database
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  // TODO: Handle failed payment
  // - Send notification to user
  // - Update subscription status
  // - Potentially disable features
}
