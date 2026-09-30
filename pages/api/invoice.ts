import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import { createBidOrder, reconcileOrder } from '../../lib/payments/orders';
import Orders from '../../models/PaymentOrder';
import Users from '../../models/User';
import { guestId } from '../../lib/guest';
import { assertSameOrigin } from '../../lib/auth';
import { HttpError, methodNotAllowed, sendError } from '../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const userId = guestId(req);
    if (!userId)
      throw new HttpError(
        401,
        'Refresh the page to restore your guest profile',
      );
    if (req.method === 'POST') {
      assertSameOrigin(req);
      const user = await Users.findOne({ userId }).lean();
      if (!user) throw new HttpError(401, 'Guest profile not found');
      const order = await createBidOrder(
        {
          shortName: req.body.shortName,
          songId: req.body.songId,
          amountSats: req.body.value,
          requestId: req.body.requestId,
        },
        user,
      );
      if (order.mintState !== 'ready')
        return res.status(503).json({
          error: 'This checkout is still being reconciled. Try again shortly.',
          retryable: true,
        });
      return res.json({
        payment_hash: order.orderId,
        status_ref: order.orderId,
        payment_request: order.paymentRequest,
      });
    }
    if (req.method === 'GET') {
      const id = req.query.hash;
      if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id))
        throw new HttpError(400, 'Invalid checkout reference');
      const saved = await Orders.findOne({
        orderId: id,
        'user.userId': userId,
      });
      if (!saved) throw new HttpError(404, 'Checkout not found');
      const order = await reconcileOrder(id);
      return res.json({
        settled: order.state === 'fulfilled',
        ...(order.state === 'expired'
          ? { terminal: true, reason: 'expired' }
          : {}),
      });
    }
    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    return sendError(res, error);
  }
});
