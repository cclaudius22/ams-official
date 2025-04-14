// src/super-admin/create/types/index.ts

export interface PersonalDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
    positionTitle: string;
  }
  
  export interface ClearanceDetails {
    level: string;
    authority: string;
    number: string;
    expiryDate: string;
    vettingDetails: {
      lastVettingDate: string;
      nextVettingDue: string;
      vettingReference: string;
      vettingAuthority: string;
    };
    specialCategories?: Array<{
      category: string;
      grantedDate: string;
      expiryDate: string;
    }>;
    renewalRequirements?: string[];
  }
  
  export interface BiometricRegistration {
    registered: boolean;
    completedAt?: string;
    methods: string[];
  }
  
  export interface DeviceRegistration {
    workstation: DeviceDetails | null;
    securityToken: DeviceDetails | null;
    mobileDevice: DeviceDetails | null;
  }
  
  export interface DeviceDetails {
    id?: string;
    deviceName?: string;
    deviceType?: string;
    registered?: boolean;
    registeredAt?: string;
    approved?: boolean;
  }
  
  export interface BackupAdminDetails {
    primaryAdmin: string;
    secondaryAdmin: string;
    verified: boolean;
  }
  
  export interface EmergencyContactDetails {
    phone: string;
    email: string;
    levels: string[];
  }
  
  export interface AccessRestrictions {
    allowedIPs: string[];
    workHours: {
      start: string;
      end: string;
    };
    allowedLocations: string[];
  }
  
  export interface SuperAdminFormData {
    // Identity & Government
    governmentId: string;
    departmentId: string;
    personalDetails: PersonalDetails;
  
    // Security & Clearance
    clearance: ClearanceDetails;
    biometrics: BiometricRegistration;
    devices: DeviceRegistration;
  
    // Access & Emergency
    backup: BackupAdminDetails;
    emergency: EmergencyContactDetails;
    access: AccessRestrictions;
  }