// src/lib/authRedirect.ts
// Pure route-gating helpers for the two-login (admin/officer) AMS demo.
// No `next/server` imports here — kept framework-free so it's unit-testable
// without a Next request/response context; src/middleware.ts is the thin
// Next-facing wrapper that reads the cookie/token and delegates here.
// Spec: docs/specs/2026-06-30-rfi-officer-roles-design.md §3 route table.

const SIGNIN = '/signin';
const ADMIN_LANDING = '/dashboard/livequeue';
const OFFICER_LANDING = '/dashboard/reviewer';

export type Role = 'admin' | 'officer';

export interface RouteDecision {
  allow: boolean;
  redirectTo?: string;
}

// Type guard: is `role` one of the two known roles? Unknown/missing role
// (undefined, '', or any string outside the two literals) must be treated
// as unauthenticated everywhere a token's role is trusted — both the
// /signin short-circuit in src/middleware.ts and routeDecision below gate
// through this single guard so they can't diverge again.
export function isKnownRole(role: string | undefined): role is Role {
  return role === 'admin' || role === 'officer';
}

// Where a freshly-authenticated user lands after sign-in.
export function landingFor(role: Role): string {
  return role === 'admin' ? ADMIN_LANDING : OFFICER_LANDING;
}

// Does `role` may see `pathname`? Unknown/missing role is treated as
// unauthenticated (controller resolution) — same handling as no valid
// token, so it's sent to /signin rather than either dashboard landing.
//
// Route access is demo-wide for both known roles: neither role is bounced
// off the other's dashboard surfaces (e.g. officer may load /dashboard/
// livequeue and /dashboard/live-intelligence; admin may load /dashboard/
// reviewer and everything under it). Role-specific dashboard gating is
// deferred — more AMS features will later split between executive and
// officer — so this only rejects unknown/missing roles.
export function routeDecision(role: string | undefined, _pathname: string): RouteDecision {
  if (!isKnownRole(role)) {
    return { allow: false, redirectTo: SIGNIN };
  }
  return { allow: true };
}
