import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectDB from '../../middleware/mongodb';
import { requireHostSession } from '../../lib/auth';
import { HttpError, methodNotAllowed } from '../../lib/http';
import Hosts from '../../models/Host';
import Accounts from '../../models/HostAccount';
import Orders from '../../models/PaymentOrder';
import Billing from '../../models/BillingCheckout';
import Plays from '../../models/Play';
import Domains from '../../models/CustomDomain';
import Payouts from '../../models/Payout';
import { subscriptionForHost } from '../../lib/subscriptions';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);
  const auth = await requireHostSession(req, res);
  if (!auth) return;
  const hostId = auth.user.id!;
  const host = await Hosts.findOne({ hostId, deletedAt: null });
  if (!host || req.body?.confirmation !== host.shortName)
    throw new HttpError(400, 'Type your jukebox URL to confirm deletion');
  if (await subscriptionForHost(hostId))
    throw new HttpError(
      409,
      'Wait for your paid subscription to end before deleting',
    );
  if (await Domains.exists({ hostId }))
    throw new HttpError(409, 'Remove your custom domain first');
  await Accounts.updateOne(
    { _id: hostId },
    { $setOnInsert: { balanceSats: 0 } },
    { upsert: true },
  );
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const account = await Accounts.findByIdAndUpdate(
        hostId,
        { $inc: { revision: 1 } },
        { new: true, session },
      );
      if (
        await Payouts.exists({
          hostId,
          state: { $in: ['reserved', 'pending'] },
        }).session(session)
      )
        throw new HttpError(409, 'Wait for your withdrawal to finish');
      if (await Domains.exists({ hostId }).session(session))
        throw new HttpError(409, 'Remove your custom domain first');
      if (account.balanceSats > 0)
        throw new HttpError(409, 'Withdraw your remaining sats first');
      if (
        (await Orders.exists({ hostId, state: 'pending' }).session(session)) ||
        (await Billing.exists({
          hostId,
          state: { $in: ['pending', 'creating', 'uncertain'] },
        }).session(session))
      )
        throw new HttpError(409, 'Pending checkouts must be resolved first');
      await Hosts.updateOne(
        { hostId },
        {
          $set: { deletedAt: new Date() },
          $unset: {
            spotifyRefreshToken: 1,
            shortName: 1,
            hostName: 1,
            accentColor: 1,
            welcomeMessage: 1,
          },
        },
        { session },
      );
      await Plays.deleteMany({ hostId }, { session });
    });
  } finally {
    await session.endSession();
  }
  return res.json({ success: true });
});
