import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import { requireHostSession } from '../../lib/auth';
import { reservePayout, processPayout } from '../../lib/payouts';
import Accounts from '../../models/HostAccount';
import Payouts from '../../models/Payout';
import { methodNotAllowed, HttpError } from '../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!['GET', 'POST'].includes(req.method ?? ''))
    return methodNotAllowed(res, ['GET', 'POST']);
  const session = await requireHostSession(req, res);
  if (!session) return;
  const hostId = session.user.id!;
  if (req.method === 'POST') {
    if (process.env.MDK_PAYOUTS_ENABLED !== 'true')
      throw new HttpError(503, 'Withdrawals are not enabled yet');
    const payout = await reservePayout(
      hostId,
      req.body.requestId,
      req.body.amountSats,
      req.body.destination,
    );
    await processPayout(payout);
  }
  const account = await Accounts.findById(hostId);
  return res.json({
    balanceSats: account?.balanceSats ?? 0,
    enabled: process.env.MDK_PAYOUTS_ENABLED === 'true',
    payouts: await Payouts.find({ hostId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
  });
});
