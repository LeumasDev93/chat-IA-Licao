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
  // Outras configurações do Next.js
})