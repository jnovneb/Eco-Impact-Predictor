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
      // El signo '$' asegura que solo coincida exactamente con 'mapbox-gl' y no afecte a 'mapbox-gl/dist/mapbox-gl.css'
      'mapbox-gl$': 'mapbox-gl/dist/mapbox-gl-csp.js',
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