// app/api/super-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with JWT or Firebase auth when implemented
async function verifyAuth(req: NextRequest): Promise<{ authenticated: boolean; user?: { id: string; permissions: string[] } }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authenticated: false };
  }
  // Placeholder: In production, verify JWT/Firebase token here
  // For now, allow requests in development
  if (process.env.NODE_ENV === 'development') {
    return {
      authenticated: true,
      user: { id: 'dev-user', permissions: ['manage_super_admin'] }
    };
  }
  return { authenticated: false };
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check authorization
    if (!hasPermission(auth.user, 'manage_super_admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    
    // Validate required fields
    const validationErrors = validateSuperAdminData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors }, 
        { status: 400 }
      );
    }
    
    // In a real application, you would save to your database here
    // For example:
    // const result = await db.superAdmin.create({
    //   data: {
    //     governmentId: data.governmentId,
    //     departmentId: data.departmentId,
    //     firstName: data.personalDetails.firstName,
    //     lastName: data.personalDetails.lastName,
    //     email: data.personalDetails.email,
    //     // ... map all other fields
    //   }
    // });
    
    // Simulate a successful response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Super Admin created successfully',
        userId: 'SA-' + Math.floor(Math.random() * 10000)
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating super admin:', error);
    return NextResponse.json(
      { error: 'Failed to create super admin' }, 
      { status: 500 }
    );
  }
}

// Permission check - uses user permissions from auth
function hasPermission(user: { id: string; permissions: string[] }, permission: string) {
  return user.permissions.includes(permission);
}

// Validation function for super admin data
function validateSuperAdminData(data: any): string[] {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.governmentId) errors.push('Government is required');
  if (!data.departmentId) errors.push('Department is required');
  
  // Personal details validation
  if (!data.personalDetails?.firstName) errors.push('First name is required');
  if (!data.personalDetails?.lastName) errors.push('Last name is required');
  if (!data.personalDetails?.email) {
    errors.push('Email is required');
  } else if (!/^.+@.+\..+$/.test(data.personalDetails.email)) {
    errors.push('Email format is invalid');
  }
  if (!data.personalDetails?.email?.endsWith('.gov.uk')) {
    errors.push('Email must be a government email');
  }
  
  // Clearance validation
  if (!data.clearance?.level) errors.push('Clearance level is required');
  if (!data.clearance?.number) errors.push('Clearance number is required');
  
  // Biometrics validation
  if (!data.biometrics?.registered) {
    errors.push('Biometric registration is required');
  }
  
  // Device validation
  if (!data.devices?.workstation && !data.devices?.securityToken && !data.devices?.mobileDevice) {
    errors.push('At least one device must be registered');
  }
  
  // Emergency contact validation
  if (!data.emergency?.phone) errors.push('Emergency phone is required');
  if (!data.emergency?.email) errors.push('Emergency email is required');
  
  // Access restrictions validation
  if (!data.access?.allowedIPs || data.access.allowedIPs.length === 0) {
    errors.push('At least one allowed IP range is required');
  }
  
  return errors;
}