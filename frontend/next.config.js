/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@deck.gl/layers', '@deck.gl/core', '@deck.gl/react'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' http://localhost:8000; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' blob: data: https://api.mapbox.com; connect-src 'self' http://localhost:8000 https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com;",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    };
    return config;
  },
};

module.exports = nextConfig;