/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental:{appDir: true},
  headers: () => [{
    source: '/:path*',
    headers: [ { key: 'Cache-Control', value: 'no-store' } ]
  }]
}

module.exports = nextConfig
