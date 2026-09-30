import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import { requireHostSession } from '../../../lib/auth';
import {
  createSubscriptionCheckout,
  cancelHostSubscription,
} from '../../../lib/billing';
import { HttpError, methodNotAllowed } from '../../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const session = await requireHostSession(req, res);
  if (!session) return;
  if (req.body.planId === 'free') {
    await cancelHostSubscription(session.user!.id!);
    return res.json({ url: '/host/settings?section=billing' });
  }
  if (!session.user?.email)
    throw new HttpError(400, 'Spotify email is required for renewal reminders');
  const record = await createSubscriptionCheckout(
    session.user.id!,
    session.user.email,
    req.body.planId,
    req.body.requestId,
  );
  if (['paid', 'expired'].includes(record.state))
    return res.status(409).json({
      error:
        'This checkout has ended. Select the plan again to start a new checkout.',
      resetCheckout: true,
    });
  if (!record.checkoutId)
    throw new HttpError(
      503,
      'Checkout is being reconciled. Retry the same checkout shortly.',
    );
  return res.json({
    url: `/checkout/${encodeURIComponent(record.checkoutId)}`,
  });
});
