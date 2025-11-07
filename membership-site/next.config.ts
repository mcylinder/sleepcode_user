import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove output: 'standalone' as it might cause issues with Vercel
  // Handle trailing slashes
  trailingSlash: false,
  // Ensure proper image optimization
  images: {
    unoptimized: false,
  },
  // Allow cross-origin requests in development
  allowedDevOrigins: ['192.168.86.23'],
};

export default nextConfig;
