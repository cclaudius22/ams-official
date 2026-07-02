// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie, type JWTPayload } from '@/lib/auth';
import { validateDemoLogin } from '@/lib/demoAccounts';
import { getOfficerById } from '@/data/seed/officers';

// Demo-only: sign a token for `payload`, set the auth cookie, and respond
// with the shape the demo dashboard expects. Shared by the demo email/
// password login and the act-as re-mint branch below so the cookie/response
// logic isn't duplicated.
function demoLoginResponse(payload: Omit<JWTPayload, 'iat' | 'exp'>): NextResponse {
  const token = generateToken(payload);
  const response = NextResponse.json({
    success: true,
    role: payload.role,
    officerId: payload.officerId,
  });
  const cookie = setAuthCookie(token);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- Demo-only auth path (DATA_PROVIDER=ams-demo) ---
    // Bypasses Prisma entirely. Supports two request shapes:
    //   1. {email, password} — seeded demo accounts (officer/admin).
    //   2. {actAsOfficerId}   — act-as re-mint, no password, validated
    //      against the seeded officers list.
    if (process.env.DATA_PROVIDER === 'ams-demo') {
      const { actAsOfficerId } = body;

      if (actAsOfficerId) {
        const officer = getOfficerById(actAsOfficerId);
        if (!officer) {
          return NextResponse.json(
            { error: 'Unknown officer id' },
            { status: 401 }
          );
        }

        const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
          userId: 'user-officer',
          email: officer.email || `${officer.id}@demo.gov`,
          role: 'officer',
          organizationId: 'ho-demo',
          officerId: officer.id,
        };

        return demoLoginResponse(payload);
      }

      const { email: demoEmail, password: demoPassword } = body;
      if (!demoEmail || !demoPassword) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const payload = validateDemoLogin(demoEmail, demoPassword);
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      return demoLoginResponse(payload);
    }
    // --- end demo-only auth path ---

    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          country: user.organization.country,
          department: user.organization.department,
        },
      },
      token,
    });

    // Set auth cookie
    const cookie = setAuthCookie(token);
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
