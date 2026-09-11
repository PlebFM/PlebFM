// Read-only by default. No environment values, customer emails or tokens are printed.
import fs from 'node:fs';
import mongoose from 'mongoose';
import Stripe from 'stripe';
async function main() {
  if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
  const apply = process.argv.includes('--apply-schema');
  const importStripe = process.argv.includes('--import-stripe');
  const required = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'MDK_ACCESS_TOKEN',
    'MDK_MNEMONIC',
    'MDK_WEBHOOK_SECRET',
    'CRON_SECRET',
    'MDK_BASIC_PRODUCT_ID',
    'MDK_PRO_PRODUCT_ID',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'PUSHER_APP_ID',
    'PUSHER_APP_SECRET',
    'NEXT_PUBLIC_PUSHER_APP_KEY',
    'NEXT_PUBLIC_PUSHER_APP_CLUSTER',
    'NEXT_PUBLIC_PUSHER_CHANNEL',
    'VERCEL_DOMAIN_TOKEN',
    'VERCEL_PROJECT_ID',
  ];
  const missing = required.filter(k => !process.env[k]);
  console.log(
    'Missing configuration:',
    missing.length ? missing.join(', ') : 'none',
  );
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0')
    console.log('BLOCKER: remove NODE_TLS_REJECT_UNAUTHORIZED=0');
  if (!process.env.MONGODB_URI) throw Error('MONGODB_URI required');
  mongoose.set('autoIndex', false);
  mongoose.set('autoCreate', false);
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  const { default: Hosts } = await import('../models/Host');
  const models = await Promise.all(
    [
      'HostAccount',
      'PaymentOrder',
      'BillingCheckout',
      'BillingReceipt',
      'HostSubscription',
      'CustomDomain',
      'Payout',
    ].map(async name => (await import(`../models/${name}`)).default),
  );
  const indexes = await Hosts.collection.indexes();
  const obsolete = indexes.filter(i => i.key.spotifyRefreshToken);
  console.log(
    'Legacy refresh-token indexes:',
    obsolete.map(i => i.name),
  );
  console.log(
    'Existing hosts:',
    await Hosts.countDocuments({ deletedAt: null }),
  );
  if (apply) {
    for (const index of obsolete) await Hosts.collection.dropIndex(index.name!);
    for (const model of [Hosts, ...models]) await model.createIndexes();
    console.log(
      'Required indexes installed; obsolete refresh-token indexes removed.',
    );
  }
  for (const name of ['PaymentOrder', 'BillingCheckout', 'Payout']) {
    const model = models.find(m => m.modelName === name);
    console.log(
      `${name} unresolved:`,
      await model.countDocuments(
        name === 'PaymentOrder'
          ? { mintState: { $in: ['creating', 'uncertain'] } }
          : name === 'BillingCheckout'
          ? { state: { $in: ['creating', 'uncertain'] } }
          : { state: { $in: ['reserved', 'pending'] } },
      ),
    );
  }
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let total = 0,
      unmapped = 0,
      imported = 0;
    const { syncStripeSubscription } = await import(
      '../lib/stripe-subscriptions'
    );
    for await (const sub of stripe.subscriptions.list({
      status: 'all',
      limit: 100,
    })) {
      total++;
      if (importStripe) {
        try {
          await syncStripeSubscription(stripe, sub.id);
          imported++;
        } catch {
          unmapped++;
        }
      } else if (
        !sub.metadata.hostId ||
        !['basic', 'pro'].includes(sub.metadata.planId)
      )
        unmapped++;
    }
    console.log('Stripe inventory:', {
      keyMode: process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
        ? 'live'
        : 'test/restricted',
      total,
      needsMappingReview: unmapped,
      imported,
    });
    if (unmapped) process.exitCode = 1;
  }
  if (
    missing.length ||
    (!apply && obsolete.length) ||
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
  )
    process.exitCode = 1;
  await mongoose.disconnect();
}
main().catch(async e => {
  console.error('Preflight failed:', e.name);
  await mongoose.disconnect();
  process.exitCode = 1;
});
