import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'drive-backend.oganilirkab.go.id',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Server-side configuration for external API calls
  serverExternalPackages: [],
  experimental: {
    // Allow server actions to run longer for API calls
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
