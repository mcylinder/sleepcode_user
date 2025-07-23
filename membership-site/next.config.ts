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
};

export default nextConfig;
