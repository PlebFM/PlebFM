import withMdkCheckout from '@moneydevkit/nextjs/next-plugin';
const config = withMdkCheckout({
  reactStrictMode: true,
  // The SDK uses extensionless ESM imports. Pages Router must bundle it too.
  transpilePackages: [
    '@moneydevkit/core',
    '@moneydevkit/nextjs',
    '@moneydevkit/api-contract',
  ],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
});
const { '*': nativeFiles = [], ...other } =
  config.outputFileTracingIncludes ?? {};
const paymentRoutes = [
  '/api/mdk',
  '/api/invoice',
  '/api/webhooks/mdk',
  '/api/jobs/reconcile',
  '/api/billing/create-checkout',
  '/api/subscriptions/current',
  '/api/payouts',
];
export default {
  ...config,
  outputFileTracingIncludes: paymentRoutes.reduce(
    (map, route) => ({
      ...map,
      [route]: [...(map[route] ?? []), ...nativeFiles],
    }),
    other,
  ),
};
