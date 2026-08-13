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
const mdkConfig = withMdkCheckout(nextConfig);

/**
 * Routes that actually load the Money Dev Kit SDK, and therefore need the
 * native Lightning addon traced into their function bundle.
 *
 * `/api/invoice` reaches it through `lib/payments`; `/api/mdk` is MDK's own
 * unified endpoint. Anything else importing `@moneydevkit/core` has to be
 * added here or it will fail at runtime with a missing native module.
 */
const MDK_ROUTES = ['/api/invoice', '/api/mdk'];

// The plugin registers those globs under `'*'`, which traces ~27 MB of native
// addon into every function — `/api/user` and `/api/hosts` included, neither of
// which touches payments. Vercel's 250 MB limit absorbs that; Netlify's 50 MB
// zipped is tighter. Scope it to the two routes that need it.
const { '*': lightningGlobs = [], ...otherIncludes } =
  mdkConfig.outputFileTracingIncludes ?? {};

export default {
  ...mdkConfig,
  outputFileTracingIncludes: MDK_ROUTES.reduce(
    (includes, route) => ({
      ...includes,
      [route]: [...(includes[route] ?? []), ...lightningGlobs],
    }),
    otherIncludes,
  ),
};
