/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/devpockit',
  output: 'export', // Enable static export for GitHub Pages
  trailingSlash: true, // Required for GitHub Pages
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
    domains: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DevPockit',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  },
  // HTTPS is handled via the dev:https script in package.json
}

module.exports = nextConfig
