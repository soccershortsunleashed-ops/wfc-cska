import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'wfccska.ru',
        port: '',
        pathname: '/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'wfccska.ru',
        port: '',
        pathname: '/upload/**',
      },
    ],
  },
  // Increase timeout for external image fetching
  experimental: {
    proxyTimeout: 30000, // 30 seconds
  },
};

export default nextConfig;
