// src/app/super-admin/create/steps/ReviewStep.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Building2,
  User,
  Mail,
  Globe,
  MapPin,
  Shield,
  Clock,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SuperAdminFormData } from '../types';
import { getCountryById, getDepartmentName, CLEARANCE_LEVELS, SESSION_DURATIONS, MFA_METHODS } from '../constants';

export const ReviewStep: React.FC = () => {
  const { control, watch } = useFormContext<SuperAdminFormData>();
  const formData = watch();

  const country = getCountryById(formData.organization.country);
  const departmentName = getDepartmentName(formData.organization.country, formData.organization.department);
  const clearanceLevel = CLEARANCE_LEVELS.find(l => l.id === formData.security.requiredClearanceLevel);
  const sessionDuration = SESSION_DURATIONS.find(s => s.value === formData.security.sessionDurationHours);
  const mfaMethod = MFA_METHODS.find(m => m.id === formData.security.mfaMethod);

  const ReviewSection = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );

  const ReviewItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
      <div>
        <span className="text-gray-500">{label}:</span>
        <span className="ml-2 text-gray-900 font-medium">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <CheckCircle2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Review Your Setup</h3>
        <p className="text-gray-600 mt-1">
          Please verify all information before creating your organization
        </p>
      </div>

      {/* Review Sections */}
      <div className="grid gap-4">
        {/* Organization Details */}
        <ReviewSection icon={Building2} title="Organization Details">
          <ReviewItem
            icon={Building2}
            label="Organization Name"
            value={formData.organization.name || 'Not specified'}
          />
          <ReviewItem
            icon={Globe}
            label="Country"
            value={country?.name || formData.organization.country || 'Not specified'}
          />
          <ReviewItem
            icon={MapPin}
            label="Department"
            value={departmentName || 'Not specified'}
          />
        </ReviewSection>

        {/* Admin Account */}
        <ReviewSection icon={User} title="Admin Account">
          <ReviewItem
            icon={User}
            label="Name"
            value={`${formData.account.firstName || ''} ${formData.account.lastName || ''}`.trim() || 'Not specified'}
          />
          <ReviewItem
            icon={Mail}
            label="Email"
            value={formData.account.email || 'Not specified'}
          />
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <span className="text-gray-500">Password:</span>
              <span className="ml-2 text-gray-900">{'*'.repeat(12)}</span>
            </div>
          </div>
        </ReviewSection>

        {/* Security Policies */}
        <ReviewSection icon={Shield} title="Security Policies">
          <ReviewItem
            icon={Shield}
            label="Required Clearance"
            value={clearanceLevel?.name || 'None required'}
          />
          <ReviewItem
            icon={Smartphone}
            label="MFA Required"
            value={formData.security.mfaRequired ? 'Yes' : 'No'}
          />
          {formData.security.mfaRequired && formData.security.mfaMethod && (
            <ReviewItem
              icon={Smartphone}
              label="Your MFA Method"
              value={mfaMethod?.name || formData.security.mfaMethod}
            />
          )}
          <ReviewItem
            icon={Clock}
            label="Session Duration"
            value={sessionDuration?.label || `${formData.security.sessionDurationHours} hours`}
          />
        </ReviewSection>
      </div>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="p-6">
          <FormField
            control={control}
            name="termsAccepted"
            rules={{ required: 'You must accept the terms and conditions' }}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="terms"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                    <p className="text-sm text-gray-500">
                      By creating this organization, you confirm that you have the authority to do so
                      and agree to be bound by our terms.
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Final Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Important</p>
            <p className="text-amber-700 mt-1">
              After creating your organization, you&apos;ll be able to invite team members,
              configure additional settings, and start using the Application Management System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
