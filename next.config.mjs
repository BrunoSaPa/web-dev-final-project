/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_EXPRESS_API_URL: process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001',
  },
  async rewrites() {
    // In production, rewrite /api/* requests to Express server
    // BUT exclude Next.js API routes that should be handled by Next.js
    if (process.env.NODE_ENV === 'production') {
      return {
        beforeFiles: [
          // First, handle requests that are NOT Next.js API routes
          // These will be proxied to Express
          {
            source: '/api/species/list',
            destination: `http://localhost:${process.env.EXPRESS_PORT || 3001}/api/species`,
          },
          {
            source: '/api/admin/:path*',
            destination: `http://localhost:${process.env.EXPRESS_PORT || 3001}/api/admin/:path*`,
          },
          // Health check and test endpoints go to Express
          {
            source: '/api/test',
            destination: `http://localhost:${process.env.EXPRESS_PORT || 3001}/api/test`,
          },
        ],
        afterFiles: [
          // After Next.js routes, any remaining /api/* goes to Express
          {
            source: '/api/:path*',
            destination: `http://localhost:${process.env.EXPRESS_PORT || 3001}/:path*`,
          },
        ],
      };
    }
    return {
      beforeFiles: [],
      afterFiles: [],
    };
  },
};

export default nextConfig;
