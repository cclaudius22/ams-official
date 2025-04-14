// src/super-admin/create/hooks/useSuperAdminForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SuperAdminFormData } from '../types';

// Initial form state with required fields
const initialFormState: SuperAdminFormData = {
  // Step 1: Identity & Government
  governmentId: '',
  departmentId: '',
  personalDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    positionTitle: ''
  },

  // Step 2: Security & Clearance
  clearance: {
    level: '',
    authority: '',
    number: '',
    expiryDate: '',
    vettingDetails: {
      lastVettingDate: '',
      nextVettingDue: '',
      vettingReference: '',
      vettingAuthority: ''
    }
  },
  biometrics: {
    registered: false,
    completedAt: null,
    methods: []
  },
  devices: {
    workstation: null,
    securityToken: null,
    mobileDevice: null
  },

  // Step 3: Access & Emergency
  backup: {
    primaryAdmin: '',
    secondaryAdmin: '',
    verified: false
  },
  emergency: {
    phone: '',
    email: '',
    levels: [],
  },
  access: {
    allowedIPs: [],
    workHours: {
      start: '',
      end: ''
    },
    allowedLocations: []
  }
};

export interface ValidationError {
  step: number;
  field: string;
  message: string;
}

export function useSuperAdminForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  const formMethods = useForm<SuperAdminFormData>({
    defaultValues: initialFormState,
    mode: 'onChange'
  });

  // Validation functions for each step
  const validateStep1 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const { getValues } = formMethods;
    const values = getValues();
    const { personalDetails } = values;

    if (!values.governmentId) {
      stepErrors.push({ step: 1, field: 'governmentId', message: 'Government selection is required' });
    }

    if (!personalDetails.firstName) {
      stepErrors.push({ step: 1, field: 'firstName', message: 'First name is required' });
    }

    if (!personalDetails.lastName) {
      stepErrors.push({ step: 1, field: 'lastName', message: 'Last name is required' });
    }

    if (!personalDetails.email?.endsWith('.gov.uk')) {
      stepErrors.push({ step: 1, field: 'email', message: 'Must use a government email address' });
    }

    return stepErrors;
  };

  const validateStep2 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const { getValues } = formMethods;
    const values = getValues();
    const { clearance, biometrics } = values;

    if (!clearance.level) {
      stepErrors.push({ step: 2, field: 'clearanceLevel', message: 'Clearance level is required' });
    }

    if (!clearance.number) {
      stepErrors.push({ step: 2, field: 'clearanceNumber', message: 'Clearance number is required' });
    }

    if (!biometrics.registered) {
      stepErrors.push({ step: 2, field: 'biometrics', message: 'Biometric registration is required' });
    }

    return stepErrors;
  };

  const validateStep3 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const { getValues } = formMethods;
    const values = getValues();
    const { backup, emergency, access } = values;

    if (!backup.primaryAdmin) {
      stepErrors.push({ step: 3, field: 'primaryAdmin', message: 'Primary backup admin is required' });
    }

    if (!emergency.phone) {
      stepErrors.push({ step: 3, field: 'emergencyPhone', message: 'Emergency contact phone is required' });
    }

    if (access.allowedIPs.length === 0) {
      stepErrors.push({ step: 3, field: 'allowedIPs', message: 'At least one IP range is required' });
    }

    return stepErrors;
  };

  // Handler for step validation
  const validateCurrentStep = (): boolean => {
    let stepErrors: ValidationError[] = [];
    
    switch (currentStep) {
      case 1:
        stepErrors = validateStep1();
        break;
      case 2:
        stepErrors = validateStep2();
        break;
      case 3:
        stepErrors = validateStep3();
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      try {
        const formData = formMethods.getValues();
        
        // API call would go here
        const response = await fetch('/api/super-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit form');
        }
        
        // Handle success
        console.log('Form submitted successfully');
        
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  return {
    currentStep,
    errors,
    formMethods,
    handleNext,
    handlePrevious,
    handleSubmit,
    validateCurrentStep
  };
}