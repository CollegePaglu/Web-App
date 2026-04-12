import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.collegepaglu.com',
      },
    ],
  },
};

export default nextConfig;
