/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Note: swcMinify removed as it's now default in Next.js 15+
  // experimental:{appDir: true}, // No longer needed as App Router is stable
  images: {
    domains: ['i.scdn.co', 'mosaic.scdn.co', 'platform-lookaside.fbsbx.com'],
    minimumCacheTTL: 604800, // 1 week caching for images (in seconds)
  },
  // Configuration for build optimization
  excludeDefaultMomentLocales: true, // For smaller bundle size
  typescript: {
    // Dangerously ignore TypeScript errors in build for now (fix properly later)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Dangerously ignore ESLint errors in build for now (fix properly later)
    ignoreDuringBuilds: true,
  },
  // Only use App Router files, exclude Pages Router completely for now
  useFileSystemPublicRoutes: true,
  transpilePackages: ['next-auth'],
  async headers() {
    return [
      // Special routes
      {
        source: '/.well-known/nostr.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // API routes with CORS
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
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
      // Avatar image caching - with ETag support and longer cache times
      {
        source: '/Avatar/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=604800, immutable, stale-while-revalidate=86400',
          },
          { key: 'Vary', value: 'Accept' },
        ],
      },
      // Other static assets caching
      {
        source: '/:path*.(jpg|jpeg|gif|png|svg|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=604800, immutable, stale-while-revalidate=86400',
          },
          { key: 'Vary', value: 'Accept' },
        ],
      },
      // Dynamic routes (must be last to not override more specific rules)
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Accept', value: '*/*' },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
