import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import Stripe from 'stripe';
import { PLANS } from '../../../models/Subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, paymentMethod } = req.body;
    const plan = PLANS.find(p => p.id === planId);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (paymentMethod === 'stripe') {
      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email,
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `PlebFM ${plan.name}`,
                description: plan.features.join(', '),
              },
              unit_amount: plan.price,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/settings?section=billing&success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/settings?section=billing&canceled=true`,
        metadata: {
          hostId: session.user.id,
          planId: plan.id,
        },
      });

      return res.status(200).json({ url: checkoutSession.url });
    } else if (paymentMethod === 'bitcoin') {
      // Create BTCPay invoice
      // TODO: Implement BTCPay Server integration
      return res.status(501).json({ error: 'Bitcoin payments coming soon' });
    }

    return res.status(400).json({ error: 'Invalid payment method' });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
