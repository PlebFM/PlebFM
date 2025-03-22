/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Note: swcMinify removed as it's now default in Next.js 15+
  // experimental:{appDir: true}, // No longer needed as App Router is stable
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

module.exports = nextConfig;
