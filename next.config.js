/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['sao-snapshot-herein-poster.trycloudflare.com'],
  turbopack: {
    root: __dirname,
  },
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
};

module.exports = nextConfig;