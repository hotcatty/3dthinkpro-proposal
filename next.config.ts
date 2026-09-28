import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Local only: `npm run dev` / `npm run admin` set different dirs so two next
  // processes can run at once. Vercel build leaves this unset → `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
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
