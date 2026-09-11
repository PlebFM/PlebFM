import {
  listProducts,
  getCheckout,
  createMoneyDevKitClient,
} from '@moneydevkit/core';
import mongoose from 'mongoose';
import Hosts from '../models/Host';
import Accounts from '../models/HostAccount';
import { createDurableCheckout } from './mdk-checkout';
import { syncMdkSubscriptions } from './mdk-subscriptions';
import BillingCheckouts from '../models/BillingCheckout';
import Subscriptions from '../models/HostSubscription';
import { PLANS } from '../models/Subscription';
import { productForPlan, subscriptionForHost } from './subscriptions';
import { HttpError } from './http';
export async function createSubscriptionCheckout(
  hostId: string,
  email: string,
  planId: string,
  requestId: string,
) {
  if (
    !['basic', 'pro'].includes(planId) ||
    !/^[-a-zA-Z0-9]{16,100}$/.test(requestId)
  )
    throw new HttpError(400, 'Choose a paid plan');
  const product = productForPlan(planId);
  if (!product)
    throw new HttpError(503, 'This plan is not yet available for purchase');
  if (await subscriptionForHost(hostId))
    throw new HttpError(
      409,
      'Your current plan remains active. Cancel it before starting another plan after its billing period ends.',
    );
  const requestKey = `${hostId}:${requestId}`;
  let record = await BillingCheckouts.findOne({ requestKey });
  if (record) {
    if (record.planId !== planId)
      throw new HttpError(409, 'Checkout plan does not match');
    return record;
  }
  // Prices shown by PlebFM must match the selected recurring product.
  const products = await listProducts();
  const remote: any = products.find(p => p.id === product);
  const expected = PLANS.find(p => p.id === planId)!;
  const price = remote?.prices?.find(
    (p: any) => p.currency === 'USD' && p.priceAmount === expected.price,
  );
  if (!price || remote.recurringInterval !== 'MONTH')
    throw new HttpError(503, 'Billing product pricing needs configuration');
  await BillingCheckouts.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Accounts.updateOne(
        { _id: hostId },
        { $inc: { revision: 1 } },
        { upsert: true, session },
      );
      if (!(await Hosts.exists({ hostId, deletedAt: null }).session(session)))
        throw new HttpError(409, 'Jukebox closed');
      [record] = await BillingCheckouts.create(
        [{ requestKey, hostId, planId }],
        { session },
      );
    });
  } catch (e: any) {
    if (e.code === 11000) {
      const pending = await BillingCheckouts.findOne({
        hostId,
        state: { $in: ['creating', 'pending', 'uncertain'] },
      });
      if (pending?.planId === planId) return pending;
      throw new HttpError(409, 'Finish your existing plan checkout first');
    }
    throw e;
  } finally {
    await session.endSession();
  }
  try {
    const checkout = await createDurableCheckout(
      {
        product,
        customer: { externalId: hostId, email },
        metadata: { billingRequestKey: requestKey },
        successUrl: '/host/settings?section=billing&refresh=1',
      },
      async id => {
        await BillingCheckouts.updateOne(
          { requestKey },
          { $set: { checkoutId: id, state: 'pending' } },
        );
      },
    );
    return await BillingCheckouts.findOneAndUpdate(
      { requestKey },
      {
        $set: {
          checkoutId: checkout.id,
          state: 'pending',
          currency: checkout.currency,
          amount: checkout.totalAmount,
        },
      },
      { new: true },
    );
  } catch (error) {
    await BillingCheckouts.updateOne(
      { requestKey },
      { $set: { state: 'uncertain' } },
    );
    throw error;
  }
}
export async function reconcileBilling(checkoutId: string) {
  const record = await BillingCheckouts.findOne({ checkoutId });
  if (!record) return;
  let checkout = await getCheckout(checkoutId);
  if (checkout.status === 'CONFIRMED')
    checkout = await createMoneyDevKitClient().checkouts.mintInvoice({
      checkoutId,
    });
  if (
    checkout.userMetadata?.billingRequestKey !== record.requestKey ||
    checkout.currency !== 'USD' ||
    checkout.totalAmount !== PLANS.find(p => p.id === record.planId)?.price
  )
    throw new HttpError(409, 'Checkout does not match the saved plan');
  if (checkout.sandbox)
    throw new HttpError(409, 'Sandbox payments cannot activate a paid plan');
  if (['PAYMENT_RECEIVED', 'COMPLETED'].includes(checkout.status)) {
    await syncMdkSubscriptions(record.hostId);
    if (!(await subscriptionForHost(record.hostId)))
      throw new HttpError(
        503,
        'Payment received; waiting for subscription activation',
      );
    await BillingCheckouts.updateOne(
      { checkoutId },
      {
        $set: {
          state: 'paid',
          paidAt: new Date(),
          amount: checkout.totalAmount,
          currency: checkout.currency,
        },
      },
    );
  } else if (checkout.status === 'EXPIRED')
    await BillingCheckouts.updateOne(
      { checkoutId },
      { $set: { state: 'expired' } },
    );
}
export async function cancelHostSubscription(hostId: string) {
  const sub = await subscriptionForHost(hostId);
  if (!sub) return;
  if (sub.provider === 'mdk') {
    await createMoneyDevKitClient().subscriptions.cancel({
      subscriptionId: sub.externalId,
    });
    await syncMdkSubscriptions(hostId);
  } else {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    await stripe.subscriptions.update(sub.externalId, {
      cancel_at_period_end: true,
    });
    await Subscriptions.updateOne(
      { _id: sub._id },
      { $set: { cancelAtPeriodEnd: true } },
    );
  }
}
