import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eco-Impact Predictor | Ocean Plastic & Wildlife Telemetry Dashboard',
  description: 'Real-time spatial analytics engine correlating marine species migration vectors with ocean microplastic gyres.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 overflow-hidden">{children}</body>
    </html>
  );
}