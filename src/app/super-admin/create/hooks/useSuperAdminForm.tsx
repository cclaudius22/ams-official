// src/app/super-admin/create/hooks/useSuperAdminForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { SuperAdminFormData, ValidationError, CreateOrganizationResponse } from '../types';
import { validatePasswordStrength } from '@/lib/password-utils';

// Initial form state
const initialFormState: SuperAdminFormData = {
  organization: {
    name: '',
    country: '',
    department: '',
  },
  account: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  security: {
    requiredClearanceLevel: 'NONE',
    mfaRequired: true,
    sessionDurationHours: 8,
    mfaMethod: 'TOTP',
  },
  termsAccepted: false,
};

export function useSuperAdminForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formMethods = useForm<SuperAdminFormData>({
    defaultValues: initialFormState,
    mode: 'onChange',
  });

  // Validation for Step 1: Organization
  const validateStep1 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const values = formMethods.getValues();
    const { organization } = values;

    if (!organization.name?.trim()) {
      stepErrors.push({ step: 1, field: 'organization.name', message: 'Organization name is required' });
    }

    if (!organization.country) {
      stepErrors.push({ step: 1, field: 'organization.country', message: 'Country is required' });
    }

    if (!organization.department) {
      stepErrors.push({ step: 1, field: 'organization.department', message: 'Department is required' });
    }

    return stepErrors;
  };

  // Validation for Step 2: Account
  const validateStep2 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const values = formMethods.getValues();
    const { account } = values;

    if (!account.firstName?.trim()) {
      stepErrors.push({ step: 2, field: 'account.firstName', message: 'First name is required' });
    }

    if (!account.lastName?.trim()) {
      stepErrors.push({ step: 2, field: 'account.lastName', message: 'Last name is required' });
    }

    if (!account.email?.trim()) {
      stepErrors.push({ step: 2, field: 'account.email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      stepErrors.push({ step: 2, field: 'account.email', message: 'Please enter a valid email address' });
    }

    if (!account.password) {
      stepErrors.push({ step: 2, field: 'account.password', message: 'Password is required' });
    } else {
      const strength = validatePasswordStrength(account.password);
      if (strength.score < 3) {
        stepErrors.push({
          step: 2,
          field: 'account.password',
          message: `Password is too weak: ${strength.feedback[0] || 'Please use a stronger password'}`,
        });
      }
    }

    if (!account.confirmPassword) {
      stepErrors.push({ step: 2, field: 'account.confirmPassword', message: 'Please confirm your password' });
    } else if (account.password !== account.confirmPassword) {
      stepErrors.push({ step: 2, field: 'account.confirmPassword', message: 'Passwords do not match' });
    }

    return stepErrors;
  };

  // Validation for Step 3: Security
  const validateStep3 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const values = formMethods.getValues();
    const { security } = values;

    if (!security.sessionDurationHours) {
      stepErrors.push({ step: 3, field: 'security.sessionDurationHours', message: 'Session duration is required' });
    }

    if (security.mfaRequired && !security.mfaMethod) {
      stepErrors.push({ step: 3, field: 'security.mfaMethod', message: 'Please select an MFA method' });
    }

    return stepErrors;
  };

  // Validation for Step 4: Review
  const validateStep4 = (): ValidationError[] => {
    const stepErrors: ValidationError[] = [];
    const values = formMethods.getValues();

    if (!values.termsAccepted) {
      stepErrors.push({ step: 4, field: 'termsAccepted', message: 'You must accept the terms and conditions' });
    }

    return stepErrors;
  };

  // Validate current step
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
      case 4:
        stepErrors = validateStep4();
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setErrors([]);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const goToStep = (step: number) => {
    if (step < currentStep || validateCurrentStep()) {
      setCurrentStep(step);
      setErrors([]);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validate all steps
    const allErrors = [
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3(),
      ...validateStep4(),
    ];

    if (allErrors.length > 0) {
      setErrors(allErrors);
      // Go to the first step with errors
      const firstErrorStep = Math.min(...allErrors.map((e) => e.step));
      setCurrentStep(firstErrorStep);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = formMethods.getValues();

      const response = await fetch('/api/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: formData.organization,
          account: {
            firstName: formData.account.firstName,
            lastName: formData.account.lastName,
            email: formData.account.email,
            password: formData.account.password,
          },
          security: formData.security,
        }),
      });

      const result: CreateOrganizationResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create organization');
      }

      // Success - redirect to login page
      router.push('/?registered=true');
    } catch (error) {
      console.error('Error creating organization:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    errors,
    formMethods,
    isSubmitting,
    submitError,
    handleNext,
    handlePrevious,
    handleSubmit,
    goToStep,
    validateCurrentStep,
    totalSteps: 4,
  };
}
