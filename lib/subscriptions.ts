import Subscriptions from '../models/HostSubscription';
import { PLANS } from '../models/Subscription';
export async function subscriptionForHost(hostId: string) {
  return Subscriptions.findOne({
    hostId,
    currentPeriodEnd: { $gt: new Date() },
    $or: [
      { status: 'active' },
      { status: 'canceled', cancelAtPeriodEnd: true },
    ],
  })
    .sort({ currentPeriodEnd: -1 })
    .lean();
}
export async function planForHost(hostId: string) {
  const sub = await subscriptionForHost(hostId);
  return PLANS.find(p => p.id === sub?.planId) ?? PLANS[0];
}
export function productForPlan(planId: string) {
  return planId === 'basic'
    ? process.env.MDK_BASIC_PRODUCT_ID
    : planId === 'pro'
    ? process.env.MDK_PRO_PRODUCT_ID
    : undefined;
}
