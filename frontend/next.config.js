/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Requerido para exportación estática de imágenes en GitHub Pages
  },
  reactStrictMode: true,
  transpilePackages: ['@deck.gl/layers', '@deck.gl/core', '@deck.gl/react'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    };
    return config;
  },
};

module.exports = nextConfig;