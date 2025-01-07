export type PlanTier = 'free' | 'basic' | 'pro';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number; // in cents
  features: string[];
  maxSongs?: number;
  maxUsers?: number;
}

export interface Subscription {
  id: string;
  hostId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod: 'stripe' | 'bitcoin';
  stripeSubscriptionId?: string;
  btcPayInvoiceId?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    features: ['20 Songs/month', 'Community Support'],
    maxSongs: 20,
  },
  {
    id: 'basic',
    name: 'Basic',
    tier: 'basic',
    price: 500, // $5
    features: ['Unlimited Songs', 'Custom Domain'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 2000, // $20
    features: [
      'Unlimited Songs',
      'Custom Domain',
      'Custom Branding',
      'Earn Revenue from your Jukebox',
    ],
  },
];
