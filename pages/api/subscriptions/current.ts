import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PLANS } from '../../../models/Subscription';
import Subscriptions from '../../../models/Subscription';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get subscription from database
    let subscription = await Subscriptions.findOne({ hostId: session.user.id });

    // If no subscription exists, create a free tier subscription
    if (!subscription) {
      subscription = await Subscriptions.create({
        hostId: session.user.id,
        planId: 'free',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now for free tier
        cancelAtPeriodEnd: false,
        paymentMethod: 'stripe',
      });
    }

    const plan = PLANS.find(p => p.id === subscription?.planId);

    return res.status(200).json({
      subscription,
      plan,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default connectDB(handler);
