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
};

export default nextConfig;
