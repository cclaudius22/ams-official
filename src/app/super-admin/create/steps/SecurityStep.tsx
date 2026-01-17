// src/app/super-admin/create/steps/SecurityStep.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Shield, Clock, Smartphone, Lock } from 'lucide-react';
import { SuperAdminFormData } from '../types';
import { CLEARANCE_LEVELS, SESSION_DURATIONS, MFA_METHODS } from '../constants';

export const SecurityStep: React.FC = () => {
  const { control, watch } = useFormContext<SuperAdminFormData>();
  const mfaRequired = watch('security.mfaRequired');

  return (
    <div className="space-y-6">
      {/* Organization Security Policies */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium">Organization Security Policies</h3>
          </div>

          <div className="space-y-6">
            {/* Required Clearance Level */}
            <FormField
              control={control}
              name="security.requiredClearanceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    Required Clearance Level for Users
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select clearance level (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLEARANCE_LEVELS.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the minimum clearance level required for users in your organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MFA Required Toggle */}
            <FormField
              control={control}
              name="security.mfaRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      Require Multi-Factor Authentication
                    </FormLabel>
                    <FormDescription>
                      Enforce MFA for all users in your organization
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Session Duration */}
            <FormField
              control={control}
              name="security.sessionDurationHours"
              rules={{ required: 'Session duration is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Default Session Duration
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select session duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SESSION_DURATIONS.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Users will be automatically logged out after this period of inactivity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Your MFA Setup */}
      {mfaRequired && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <Smartphone className="mr-2 h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Your MFA Method</h3>
            </div>

            <FormField
              control={control}
              name="security.mfaMethod"
              rules={{ required: mfaRequired ? 'Please select an MFA method' : false }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your preferred MFA method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {MFA_METHODS.map((method) => (
                        <div key={method.id} className="flex items-start space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                          <Label htmlFor={method.id} className="cursor-pointer flex-1">
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-500">{method.description}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">
                You&apos;ll set up your MFA device after completing the registration.
                This can be changed later in your account settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Security Best Practices</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>- Enable MFA for all users to prevent unauthorized access</li>
          <li>- Use shorter session durations for sensitive operations</li>
          <li>- Regularly review and update security policies</li>
        </ul>
      </div>
    </div>
  );
};
