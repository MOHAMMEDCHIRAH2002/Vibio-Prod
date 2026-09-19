/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ESLint style rules (e.g. react/no-unescaped-entities) must not block the
  // production/Docker build. Lint still runs via `npm run lint`. TypeScript
  // type-checking stays enabled, so real type errors still fail the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
    formats: ['image/avif', 'image/webp'], // prefer AVIF → smallest payload
    minimumCacheTTL: 60 * 60 * 24 * 7,    // cache optimized images 7 days
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-accordion',
    ],
  },
  // Persist the module graph between dev server restarts so navigation
  // doesn't re-compile shared chunks on every page visit in development.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
      };
    }
    return config;
  },
};

module.exports = nextConfig;
