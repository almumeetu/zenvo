import type { NextConfig } from 'next';
import path from 'path';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  outputFileTracingRoot: '/Users/softzinoacademy',
} as any;

export default nextConfig;
