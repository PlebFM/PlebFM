import { withDeadline } from '../../../lib/payments/deadline';
import type { NextApiRequest, NextApiResponse } from 'next';
import { timingSafeEqual } from 'crypto';
import connectDB from '../../../middleware/mongodb';
import Orders from '../../../models/PaymentOrder';
import Billing from '../../../models/BillingCheckout';
import Payouts from '../../../models/Payout';
import { reconcileOrder } from '../../../lib/payments/orders';
import { reconcileBilling } from '../../../lib/billing';
import { processPayout } from '../../../lib/payouts';
import { methodNotAllowed } from '../../../lib/http';
export const config = { maxDuration: 60 };
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!['GET', 'POST'].includes(req.method ?? ''))
    return methodNotAllowed(res, ['GET', 'POST']);
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ''}`),
    provided = Buffer.from(req.headers.authorization ?? '');
  if (
    !process.env.CRON_SECRET ||
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  )
    return res.status(401).json({ error: 'Unauthorized' });
  return connectDB(async () => {
    const orders = await Orders.find({
      statusRef: { $type: 'string' },
      $or: [
        {
          state: { $in: ['pending', 'uncertain'] },
          checkoutId: { $type: 'string' },
        },
        { state: 'fulfilled', notifiedAt: { $exists: false } },
      ],
    })
      .sort({ checkedAt: 1 })
      .limit(4);
    const billing = await Billing.find({
      state: { $in: ['pending', 'uncertain'] },
      checkoutId: { $type: 'string' },
    })
      .sort({ updatedAt: 1 })
      .limit(3);
    const payouts = await Payouts.find({
      state: { $in: ['reserved', 'pending'] },
    })
      .sort({ updatedAt: 1 })
      .limit(2);
    let failures = 0;
    const jobs = [
      ...orders.map(order => async () => {
        try {
          await reconcileOrder(order.orderId);
        } finally {
          await Orders.updateOne(
            { _id: order._id },
            { $set: { checkedAt: new Date() } },
          );
        }
      }),
      ...billing.map(item => async () => {
        try {
          await reconcileBilling(item.checkoutId);
        } finally {
          await Billing.updateOne(
            { _id: item._id },
            { $set: { updatedAt: new Date() } },
          );
        }
      }),
      ...payouts.map(item => async () => {
        try {
          await processPayout(item);
        } finally {
          await Payouts.updateOne(
            { _id: item._id },
            { $set: { updatedAt: new Date() } },
          );
        }
      }),
    ];
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        while (jobs.length) {
          const job = jobs.shift()!;
          try {
            await withDeadline('reconciliation', job, 12000);
          } catch {
            failures++;
          }
        }
      }),
    );
    const unresolved =
      (await Orders.countDocuments({
        mintState: { $in: ['creating', 'uncertain'] },
        statusRef: { $exists: false },
        createdAt: { $lt: new Date(Date.now() - 120000) },
      })) +
      (await Billing.countDocuments({
        state: { $in: ['creating', 'uncertain'] },
        checkoutId: { $exists: false },
        createdAt: { $lt: new Date(Date.now() - 120000) },
      }));
    return res.status(failures || unresolved ? 503 : 200).json({
      checked: orders.length + billing.length + payouts.length,
      failures,
      unresolved,
    });
  })(req, res);
}
