/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Permite alternar temas vía clase en el <html>
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores para el modo Ocean
        ocean: {
          950: '#031327',
          900: '#072446',
          800: '#0e3a6c',
          700: '#165294',
          400: '#38bdf8',
          300: '#7dd3fc',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};