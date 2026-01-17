// src/app/api/super-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

interface CreateOrganizationRequest {
  organization: {
    name: string;
    country: string;
    department: string;
  };
  account: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  security: {
    requiredClearanceLevel: string;
    mfaRequired: boolean;
    sessionDurationHours: number;
    mfaMethod: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const data: CreateOrganizationRequest = await req.json();

    // Validate required fields
    const validationErrors = validateRequest(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.account.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(data.account.password);

    // Create organization, user, and config in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organization.name,
          country: data.organization.country,
          department: data.organization.department,
        },
      });

      // Create super admin user
      const user = await tx.user.create({
        data: {
          email: data.account.email.toLowerCase(),
          passwordHash,
          firstName: data.account.firstName,
          lastName: data.account.lastName,
          role: 'SUPER_ADMIN',
          mfaEnabled: data.security.mfaRequired,
          organizationId: organization.id,
        },
      });

      // Create system config
      const config = await tx.systemConfig.create({
        data: {
          organizationId: organization.id,
          requiredClearanceLevel: data.security.requiredClearanceLevel || null,
          mfaRequired: data.security.mfaRequired,
          sessionDurationHours: data.security.sessionDurationHours,
        },
      });

      return { organization, user, config };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Organization created successfully',
        organizationId: result.organization.id,
        userId: result.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create organization. Please try again.' },
      { status: 500 }
    );
  }
}

// Validation function
function validateRequest(data: CreateOrganizationRequest): string[] {
  const errors: string[] = [];

  // Organization validation
  if (!data.organization?.name?.trim()) {
    errors.push('Organization name is required');
  }
  if (!data.organization?.country) {
    errors.push('Country is required');
  }
  if (!data.organization?.department) {
    errors.push('Department is required');
  }

  // Account validation
  if (!data.account?.firstName?.trim()) {
    errors.push('First name is required');
  }
  if (!data.account?.lastName?.trim()) {
    errors.push('Last name is required');
  }
  if (!data.account?.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.account.email)) {
    errors.push('Email format is invalid');
  }
  if (!data.account?.password) {
    errors.push('Password is required');
  } else if (data.account.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Security validation
  if (data.security?.sessionDurationHours === undefined) {
    errors.push('Session duration is required');
  }

  return errors;
}

// GET endpoint to check if any organization exists (for first-time setup check)
export async function GET() {
  try {
    const orgCount = await prisma.organization.count();

    return NextResponse.json({
      hasOrganizations: orgCount > 0,
      count: orgCount,
    });
  } catch (error) {
    console.error('Error checking organizations:', error);
    return NextResponse.json(
      { error: 'Failed to check organizations' },
      { status: 500 }
    );
  }
}
