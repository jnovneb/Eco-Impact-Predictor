import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Eco-Impact Predictor | Ocean Plastic Dashboard',
  description: 'Real-time spatial analytics engine correlating marine species migration vectors with ocean microplastic gyres.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com; worker-src 'self' blob:; child-src blob:; img-src 'self' data: blob: https://*.mapbox.com https://api.mapbox.com; connect-src 'self' https://*.mapbox.com https://api.mapbox.com https://eco-impact-predictor.onrender.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com;"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}