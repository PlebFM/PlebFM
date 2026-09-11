import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import { requireHostSession } from '../../../lib/auth';
import Billing from '../../../models/BillingReceipt';
import { HttpError, methodNotAllowed } from '../../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const session = await requireHostSession(req, res);
  if (!session) return;
  if (typeof req.query.id !== 'string')
    throw new HttpError(400, 'Receipt ID required');
  const item = await Billing.findOne({
    receiptId: req.query.id,
    hostId: session.user!.id,
  });
  if (!item) throw new HttpError(404, 'Receipt not found');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="plebfm-receipt.txt"',
  );
  return res.send(
    `PlebFM payment receipt\nReference: ${item.receiptId}\nPlan: ${
      item.planId
    }\nPaid: ${item.paidAt.toISOString()}\nAmount: ${
      item.currency === 'USD' ? item.amount / 100 : item.amount
    } ${item.currency}\n`,
  );
});
