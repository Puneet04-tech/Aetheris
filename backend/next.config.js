/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@neondatabase/serverless'],
  // IMPORTANT: Never expose sensitive environment variables in next.config.js
  // Always use process.env only where absolutely necessary (server-side only)
  // Client-side env variables should NEVER contain secrets
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
};

module.exports = nextConfig;
