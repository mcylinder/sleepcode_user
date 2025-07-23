import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure proper static generation
  output: 'standalone',
  // Handle trailing slashes
  trailingSlash: false,
  // Ensure proper image optimization
  images: {
    unoptimized: false,
  },
  // Force Vercel to use correct configuration
  experimental: {
    // This will help Vercel detect the correct configuration
  },
};

export default nextConfig;
