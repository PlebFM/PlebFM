import mongoose, { Schema } from 'mongoose';

export type Plan = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['20 Songs/month', 'Community Support'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 500, // $5
    features: ['Unlimited Songs', 'Custom Domain'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2000, // $20
    features: [
      'Unlimited Songs',
      'Custom Domain',
      'Custom Branding',
      'Earn Revenue from your Jukebox',
    ],
  },
];

// export const PLANS: Plan[] = [
//   {
//     id: 'free',
//     name: 'Free',
//     price: 0,
//     features: ['Basic features', 'Up to 50 songs per day'],
//   },
//   {
//     id: 'pro',
//     name: 'Pro',
//     price: 2900,
//     features: [
//       'Everything in Free',
//       'Unlimited songs',
//       'Priority support',
//       'Custom branding',
//     ],
//   },
//   {
//     id: 'enterprise',
//     name: 'Enterprise',
//     price: 9900,
//     features: [
//       'Everything in Pro',
//       'Multiple venues',
//       'API access',
//       'Dedicated support',
//     ],
//   },
// ];

export type Subscription = {
  hostId: string;
  planId: 'free' | 'basic' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod: 'stripe' | 'bitcoin';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
};

const SubscriptionSchema = new Schema<Subscription>(
  {
    hostId: {
      type: String,
      required: true,
      unique: true,
    },
    planId: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      required: true,
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete'],
      required: true,
      default: 'active',
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      required: true,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'bitcoin'],
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

SubscriptionSchema.index({ hostId: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });

// Try to get existing model, or create new one
let Subscriptions: mongoose.Model<Subscription>;
try {
  Subscriptions = mongoose.model('subscriptions');
} catch {
  Subscriptions = mongoose.model('subscriptions', SubscriptionSchema);
}

export default Subscriptions;
