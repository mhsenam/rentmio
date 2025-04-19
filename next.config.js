/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    // Using the correct property name as indicated in the warning
    serverExternalPackages: []
  },
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com']
  }
};

module.exports = nextConfig; 