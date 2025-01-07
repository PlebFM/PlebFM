import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PLANS } from '../../../models/Subscription';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Replace with actual database query
    // For now, return a mock subscription
    const mockSubscription = {
      id: 'mock-sub-1',
      hostId: session.user.id,
      planId: 'pro',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
      paymentMethod: 'stripe',
    };

    const plan = PLANS.find(p => p.id === mockSubscription.planId);

    return res.status(200).json({
      subscription: mockSubscription,
      plan,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
