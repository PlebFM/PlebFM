import { syncMdkSubscriptions } from '../../../lib/mdk-subscriptions';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import { requireHostSession } from '../../../lib/auth';
import { planForHost, subscriptionForHost } from '../../../lib/subscriptions';
import { cancelHostSubscription, reconcileBilling } from '../../../lib/billing';
import BillingCheckouts from '../../../models/BillingCheckout';
import Receipts from '../../../models/BillingReceipt';
import { methodNotAllowed } from '../../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!['GET', 'POST', 'DELETE'].includes(req.method ?? ''))
    return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  const session = await requireHostSession(req, res);
  if (!session) return;
  const hostId = session.user!.id!;
  if (req.method === 'DELETE') await cancelHostSubscription(hostId);
  if (req.method === 'POST') {
    const pending = await BillingCheckouts.find({
      hostId,
      state: 'pending',
    }).limit(10);
    for (const record of pending) await reconcileBilling(record.checkoutId);
    if (
      process.env.MDK_ACCESS_TOKEN &&
      (await BillingCheckouts.exists({ hostId, state: 'paid' }))
    )
      await syncMdkSubscriptions(hostId);
  }
  return res.json({
    subscription: await subscriptionForHost(hostId),
    plan: await planForHost(hostId),
    history: await Receipts.find({ hostId })
      .sort({ paidAt: -1 })
      .limit(100)
      .lean(),
  });
});
