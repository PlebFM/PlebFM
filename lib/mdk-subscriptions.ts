import { saveSubscription } from './save-subscription';
import Subscriptions from '../models/HostSubscription';
import { productForPlan } from './subscriptions';
import Receipts from '../models/BillingReceipt';
export async function syncMdkSubscriptions(hostId: string) {
  const checkedAt = new Date();
  const { getCustomer } = await import('@moneydevkit/core');
  const customer = await getCustomer({ externalId: hostId });
  for (const sub of customer.subscriptions) {
    const planId = ['basic', 'pro'].find(
      id => productForPlan(id) === sub.productId,
    );
    if (!planId) continue;
    await saveSubscription(
      'mdk',
      sub.id,
      {
        hostId,
        customerId: sub.customerId,
        planId,
        status: sub.status,
        currentPeriodStart: new Date(sub.currentPeriodStart),
        currentPeriodEnd: new Date(sub.endsAt || sub.currentPeriodEnd),
        cancelAtPeriodEnd: !!sub.cancelAtPeriodEnd,
      },
      checkedAt,
    );
    if (sub.status === 'active')
      await Receipts.updateOne(
        { receiptId: `mdk:${sub.id}:${sub.currentPeriodStart}` },
        {
          $setOnInsert: {
            hostId,
            provider: 'mdk',
            planId,
            amount: sub.amount,
            currency: sub.currency,
            paidAt: new Date(sub.currentPeriodStart),
          },
        },
        { upsert: true },
      );
  }
}
