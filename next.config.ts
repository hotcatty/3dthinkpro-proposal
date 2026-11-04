import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Local only: `npm run dev` / `npm run admin` set different dirs so two next
  // processes can run at once. Vercel build leaves this unset → `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      {
        source: '/products/kawasaki-ninjia500',
        destination: '/products/kawasaki-ninja500',
        permanent: true,
      },
      {
        source: '/products/kawasaki-ninjia500/:path*',
        destination: '/products/kawasaki-ninja500/:path*',
        permanent: true,
      },
    ];
  },
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/cssinjs', 'rc-util', 'rc-pagination', 'rc-picker'],
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'mock.shop' },
    ],
  },
};

export default nextConfig;
