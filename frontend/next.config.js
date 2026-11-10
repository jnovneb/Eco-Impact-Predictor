/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  transpilePackages: ['@deck.gl/layers', '@deck.gl/core', '@deck.gl/react'],

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force Mapbox to use the CSP-compliant bundle natively
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl-csp.js',
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;