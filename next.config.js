/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
};

module.exports = nextConfig;
