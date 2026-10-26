import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const cspHeader = `
    default-src 'self' http://localhost:8000;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com;
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline' https://api.mapbox.com;
    img-src 'self' blob: data: https://api.mapbox.com;
    connect-src 'self' http://localhost:8000 https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: '/:path*',
};