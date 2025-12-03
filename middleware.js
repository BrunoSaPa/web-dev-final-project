import { NextResponse } from 'next/server';

export function middleware(request) {
  // For API routes, we let Next.js handle them (they go to the route handlers)
  // This middleware doesn't interfere with /api/* routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
