import type { NextConfig } from "next";
import path from "path";

const appRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: false,
  },
  // Pin the app root so Next doesn't pick a parent lockfile (breaks turbopack fonts).
  outputFileTracingRoot: appRoot,
  turbopack: {
    root: appRoot,
  },
  // Local + LAN testing (phone on Wi-Fi, 127.0.0.1 vs localhost).
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.86.220', '192.168.86.23'],
  // The Library moved from /application to /library, and the player to /play/<session>.
  // Permanent redirects keep old links, bookmarks and search results working.
  async redirects() {
    return [
      {
        source: '/application/player',
        has: [{ type: 'query', key: 'session', value: '(?<session>.+)' }],
        destination: '/play/:session',
        permanent: true,
      },
      { source: '/application/player', destination: '/library', permanent: true },
      { source: '/application/script', destination: '/library/script', permanent: true },
      { source: '/application', destination: '/library', permanent: true },
    ];
  },
};

export default nextConfig;
