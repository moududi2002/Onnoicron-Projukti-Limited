// next.config.js (Next.js 16 syntax)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.yourschool.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;