import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Public routes that don't require auth
const PUBLIC_ROUTES = ['/host/login', '/host/signup', '/host/plans'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow public routes without auth
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }

    // If not authenticated, redirect to login
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/host/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle auth in middleware function
    },
  },
);

export const config = {
  matcher: ['/host/:path*'],
};
