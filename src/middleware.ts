// src/middleware.ts
// Coarse, role-only route gating for the two-login (admin/officer) AMS demo.
// Reads the `auth-token` cookie, verifies it, and delegates the allow/
// redirect decision to the pure helpers in src/lib/authRedirect.ts.
//
// NOT in scope here: per-case ownership (assignedTo === token.officerId) —
// that's Task 5, enforced at the per-case page + review/RFI APIs. API
// routes are not gated by this middleware either.
//
// `verifyToken` (src/lib/auth.ts) uses `jsonwebtoken`, which needs Node
// crypto and breaks on the default edge runtime — so this middleware must
// run on the Node.js runtime (`config.runtime = 'nodejs'` below).
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { landingFor, routeDecision } from '@/lib/authRedirect';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth-token')?.value;
  const payload = token ? verifyToken(token) : null;

  // /signin: a validly-authenticated user shouldn't see the login page —
  // bounce them straight to their landing. No/invalid token → let them
  // through to sign in.
  if (pathname === '/signin') {
    if (payload) {
      const landingUrl = request.nextUrl.clone();
      landingUrl.pathname = landingFor(payload.role as 'admin' | 'officer');
      return NextResponse.redirect(landingUrl);
    }
    return NextResponse.next();
  }

  // /dashboard/**: no cookie or an invalid token → /signin. A valid token
  // still runs through routeDecision, which itself treats an unknown/
  // missing role the same as unauthenticated.
  if (!payload) {
    const signinUrl = request.nextUrl.clone();
    signinUrl.pathname = '/signin';
    return NextResponse.redirect(signinUrl);
  }

  const decision = routeDecision(payload.role, pathname);
  if (!decision.allow) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = decision.redirectTo!;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin'],
  runtime: 'nodejs',
};
