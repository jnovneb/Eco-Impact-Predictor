/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: false, // Previene doble renderizado y re-inicialización de WebGL en dev
  transpilePackages: ['@deck.gl/layers', '@deck.gl/core', '@deck.gl/react'],
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com",
              "worker-src 'self' blob:",
              "child-src blob:",
              "img-src 'self' data: blob: https://*.mapbox.com https://api.mapbox.com",
              "connect-src 'self' https://*.mapbox.com https://api.mapbox.com https://eco-impact-predictor.onrender.com",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
            ].join('; '),
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    };
    
    // Ignore node fs/module fallback errors in client workers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;