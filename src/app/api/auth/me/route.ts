// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current user from token
    const tokenPayload = await getCurrentUser(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        organization: {
          include: {
            config: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
          config: user.organization.config ? {
            mfaRequired: user.organization.config.mfaRequired,
            sessionDurationHours: user.organization.config.sessionDurationHours,
            requiredClearanceLevel: user.organization.config.requiredClearanceLevel,
          } : null,
        },
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
