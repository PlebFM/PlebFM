import withMdkCheckout from '@moneydevkit/nextjs/next-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // experimental:{appDir: true},
  headers: () => [
    {
      source: '/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    },
  ],
  async headers() {
    return [
      {
        source: '/.well-known/nostr.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Accept', value: '*/*' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'origins', value: '*' },
          { key: 'Bypass-Tunnel-Reminder', value: '*' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Request-Methods',
            value: 'POST, GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Content-Type',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
};

// Adds `serverExternalPackages` and `outputFileTracingIncludes` for the
// @moneydevkit/lightning-js native addon so it survives bundling and is traced
// into the deployed functions.
export default withMdkCheckout(nextConfig);
