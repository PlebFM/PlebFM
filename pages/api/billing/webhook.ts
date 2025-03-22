import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import Subscriptions from '../../../models/Subscription';
import connectDB from '../../../middleware/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Disable body parsing, need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return res
      .status(400)
      .json({ error: 'Webhook signature verification failed' });
  }

  console.log('Webhook event received:', event.type);

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
};

export default connectDB(handler);

async function updateSubscription(subscription: Stripe.Subscription) {
  try {
    console.log(
      'Subscription data:',
      JSON.stringify(
        {
          id: subscription.id,
          customer: subscription.customer,
          metadata: subscription.metadata,
          status: subscription.status,
        },
        null,
        2,
      ),
    );

    // For test webhook events, use a test hostId
    const hostId =
      process.env.NODE_ENV === 'development'
        ? 'test_host_id'
        : subscription.metadata?.hostId;

    if (!hostId) {
      throw new Error('No hostId found in subscription metadata');
    }

    // Update or create subscription document
    await Subscriptions.findOneAndUpdate(
      { hostId },
      {
        planId: subscription.metadata?.planId || 'pro', // default to pro for test events
        status: subscription.status === 'active' ? 'active' : 'past_due',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        paymentMethod: 'stripe',
      },
      { upsert: true, new: true },
    );

    console.log(`Updated subscription for host ${hostId}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  try {
    console.log(
      'Cancellation data:',
      JSON.stringify(
        {
          id: subscription.id,
          metadata: subscription.metadata,
          status: subscription.status,
        },
        null,
        2,
      ),
    );

    // For test webhook events, use a test hostId
    const hostId =
      process.env.NODE_ENV === 'development'
        ? 'test_host_id'
        : subscription.metadata?.hostId;

    if (!hostId) {
      throw new Error('No hostId found in subscription metadata');
    }

    // Update subscription to free tier and mark as canceled
    await Subscriptions.findOneAndUpdate(
      { hostId },
      {
        planId: 'free',
        status: 'canceled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      { new: true },
    );

    console.log(`Canceled subscription for host ${hostId}`);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  try {
    console.log(
      'Invoice data:',
      JSON.stringify(
        {
          id: invoice.id,
          subscription: invoice.subscription,
          customer: invoice.customer,
        },
        null,
        2,
      ),
    );

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );

    // For test webhook events, use a test hostId
    const hostId =
      process.env.NODE_ENV === 'development'
        ? 'test_host_id'
        : subscription.metadata?.hostId;

    if (!hostId) {
      throw new Error('No hostId found in subscription metadata');
    }

    // Mark subscription as past_due
    await Subscriptions.findOneAndUpdate(
      { hostId },
      {
        status: 'past_due',
      },
      { new: true },
    );

    console.log(`Marked subscription as past_due for host ${hostId}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}
