// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  scope: '/',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offline-cache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

module.exports = withPWA({
  reactStrictMode: true,
  serverExternalPackages: ['puppeteer'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Configurações para Vercel
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals.push({
        'puppeteer': 'commonjs puppeteer',
      });
    }
    return config;
  },
})