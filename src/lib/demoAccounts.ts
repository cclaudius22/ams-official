// src/lib/demoAccounts.ts
// Seeded demo accounts for the AMS two-login (admin + officer) demo flow.
// Fixed, well-known credentials — demo/dashboard use only, not for production.

import type { JWTPayload } from '@/lib/auth';

export interface DemoAccount {
  email: string;
  password: string;
  payload: Omit<JWTPayload, 'iat' | 'exp'>;
}

export const demoAccounts: DemoAccount[] = [
  {
    email: 'admin@demo.gov',
    password: 'admin',
    payload: {
      userId: 'user-admin',
      email: 'admin@demo.gov',
      role: 'admin',
      organizationId: 'ho-demo',
    },
  },
  {
    email: 'officer@demo.gov',
    password: 'officer',
    payload: {
      userId: 'user-officer',
      email: 'officer@demo.gov',
      role: 'officer',
      organizationId: 'ho-demo',
      officerId: 'officer-demo',
    },
  },
];

// Validate demo login credentials and return the JWT payload to sign.
// Constant-time-ish: always compares both email and password rather than
// short-circuiting on the first mismatch, so failure timing doesn't leak
// which field was wrong.
export function validateDemoLogin(
  email: string,
  password: string
): Omit<JWTPayload, 'iat' | 'exp'> | null {
  let match: DemoAccount | null = null;

  for (const account of demoAccounts) {
    const emailMatches = account.email === email;
    const passwordMatches = account.password === password;
    if (emailMatches && passwordMatches) {
      match = account;
    }
  }

  return match ? match.payload : null;
}
