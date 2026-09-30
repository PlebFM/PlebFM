import Stripe from 'stripe';
import Subscriptions from '../models/HostSubscription';
import { saveSubscription } from './save-subscription';
import { HttpError } from './http';
export async function syncStripeSubscription(stripe: Stripe, id: string) {
  const checkedAt = new Date();
  const current = await stripe.subscriptions.retrieve(id);
  const saved = await Subscriptions.findOne({
    provider: 'stripe',
    externalId: id,
  });
  let hostId = current.metadata.hostId || saved?.hostId,
    planId = current.metadata.planId || saved?.planId;
  if (!hostId) {
    const sessions = await stripe.checkout.sessions.list({
      subscription: id,
      limit: 1,
    });
    hostId = sessions.data[0]?.metadata?.hostId;
    planId = sessions.data[0]?.metadata?.planId;
  }
  if (!hostId || !['basic', 'pro'].includes(planId))
    throw new HttpError(503, 'Subscription requires account reconciliation');
  await saveSubscription(
    'stripe',
    id,
    {
      hostId,
      planId,
      customerId:
        typeof current.customer === 'string'
          ? current.customer
          : current.customer.id,
      status: current.status,
      currentPeriodStart: new Date(current.current_period_start * 1000),
      currentPeriodEnd: new Date(
        (current.ended_at || current.current_period_end) * 1000,
      ),
      cancelAtPeriodEnd: current.cancel_at_period_end,
    },
    checkedAt,
  );
  return { hostId, planId };
}
