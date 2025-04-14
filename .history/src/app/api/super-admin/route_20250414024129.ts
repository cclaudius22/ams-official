// app/api/super-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Check authorization (this would use your permission system)
    if (!hasPermission(session, 'manage_super_admin')) {
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

// Mock permissions check - replace with your actual auth logic
function hasPermission(session: any, permission: string) {
  // For demo purposes, assume the user has permission
  return true;
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