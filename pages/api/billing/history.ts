import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = session.user as { stripeCustomerId?: string };
    if (!user.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24, // Last 2 years of monthly invoices
      status: 'paid',
    });

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toLocaleDateString(),
      amount: invoice.amount_paid,
      status: invoice.status,
      description: invoice.lines.data[0]?.description || 'Subscription Payment',
      receiptUrl: invoice.hosted_invoice_url,
    }));

    return res.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return res.status(500).json({ error: 'Failed to fetch billing history' });
  }
};

export default handler;
