// Disposable local UI fixture. No .env file is loaded into this process. The
// child app is explicitly prevented from using any real provider credentials.
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { encode } = require('next-auth/jwt');
const { spawn } = require('node:child_process');
const http = require('node:http');
(async () => {
  const mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: '7.0.14' },
  });
  const client = await MongoClient.connect(mongo.getUri());
  const db = client.db();
  const secret = require('node:crypto').randomBytes(32).toString('hex');
  await db.collection('hosts-v3').insertOne({
    hostId: 'fixture-host',
    spotifyId: 'fixture-host',
    hostName: 'Local Test Venue',
    shortName: 'local-venue',
    spotifyRefreshToken: 'TEST-ONLY-NOT-A-REAL-TOKEN',
    deletedAt: null,
    accentColor: '#22c55e',
    welcomeMessage: 'Welcome to the local jukebox',
  });
  await db.collection('hostaccounts').insertOne({
    _id: 'fixture-host',
    balanceSats: 90,
    receivedSats: 100,
    earnedSats: 90,
    revision: 1,
  });
  await db.collection('hostsubscriptions').insertOne({
    hostId: 'fixture-host',
    provider: 'mdk',
    externalId: 'fixture-sub',
    planId: 'pro',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    cancelAtPeriodEnd: false,
  });
  await db.collection('billingreceipts').insertOne({
    receiptId: 'fixture-receipt',
    hostId: 'fixture-host',
    provider: 'mdk',
    planId: 'pro',
    amount: 2000,
    currency: 'USD',
    paidAt: new Date(),
  });
  await db.collection('paymentorders').insertOne({
    orderId: 'fixture-order',
    requestKey: 'fixture-request',
    hostId: 'fixture-host',
    shortName: 'local-venue',
    state: 'fulfilled',
    mintState: 'ready',
    provider: 'mdk',
    amountSats: 100,
    netAmountSats: 90,
    earnsRevenue: true,
    paidAt: new Date(),
    notifiedAt: new Date(),
  });
  const env = {
    ...process.env,
    MONGODB_URI: mongo.getUri(),
    NEXTAUTH_SECRET: secret,
    NEXTAUTH_URL: 'http://localhost:3100',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3100',
    NODE_TLS_REJECT_UNAUTHORIZED: '1',
    MDK_PAYOUTS_ENABLED: 'false',
    PAYMENT_PROVIDER: 'mdk',
  };
  for (const key of [
    'MDK_ACCESS_TOKEN',
    'MDK_MNEMONIC',
    'MDK_WEBHOOK_SECRET',
    'CRON_SECRET',
    'MDK_BASIC_PRODUCT_ID',
    'MDK_PRO_PRODUCT_ID',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'LNBITS_URL',
    'LNBITS_API_KEY',
    'LNBITS_API_KEY_ADMIN',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'PUSHER_APP_ID',
    'PUSHER_APP_SECRET',
    'NEXT_PUBLIC_PUSHER_APP_KEY',
    'VERCEL_DOMAIN_TOKEN',
    'VERCEL_PROJECT_ID',
    'VERCEL_TEAM_ID',
  ])
    env[key] = '';
  const app = spawn(
    process.execPath,
    [require.resolve('next/dist/bin/next'), 'start', '-p', '3100'],
    { env, stdio: 'inherit' },
  );
  const login = http.createServer(async (req, res) => {
    if (req.url !== '/signin') {
      res.writeHead(404);
      res.end();
      return;
    }
    const token = await encode({
      secret,
      token: {
        authVersion: 2,
        user: {
          id: 'fixture-host',
          email: 'fixture@example.invalid',
          name: 'Local Host',
        },
        accessToken: 'TEST-ONLY',
        accessTokenExpires: Date.now() + 3600000,
      },
      maxAge: 3600,
    });
    res.writeHead(302, {
      'Set-Cookie': `next-auth.session-token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
      Location: 'http://localhost:3100/host/dashboard',
    });
    res.end();
  });
  login.listen(3101, '127.0.0.1', () =>
    console.log(
      'Local fixture: http://localhost:3100 ; synthetic sign-in: http://127.0.0.1:3101/signin (use localhost host for shared cookies)',
    ),
  );
  async function stop() {
    app.kill('SIGTERM');
    login.close();
    await client.close();
    await mongo.stop();
    process.exit();
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})().catch(e => {
  console.error(e.name, e.message);
  process.exit(1);
});
