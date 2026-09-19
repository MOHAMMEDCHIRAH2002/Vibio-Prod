import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Fast-path: if the session cookie is absent, skip JWT decode entirely
  const sessionCookie =
    req.cookies.get('next-auth.session-token') ??
    req.cookies.get('__Secure-next-auth.session-token');

  if (!sessionCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    const homeUrl = new URL('/', req.url);
    homeUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin/:path*'],
};
