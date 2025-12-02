/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_EXPRESS_API_URL: process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
