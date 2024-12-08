/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // experimental:{appDir: true},
  async headers() {
    return [
      {
        source: '/.well-known/nostr.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // {
      //   source: '/:path*',
      //   headers: [
      //     { key: 'Cache-Control', value: 'no-store' },
      //   ],
      // },
      {
        source: '/api/:path*',
        headers: [
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
