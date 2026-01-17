// src/app/super-admin/create/steps/OrganizationStep.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Building2, Globe, MapPin } from 'lucide-react';
import { SuperAdminFormData } from '../types';
import { COUNTRIES, getDepartmentsByCountry } from '../constants';

export const OrganizationStep: React.FC = () => {
  const { control, watch, setValue } = useFormContext<SuperAdminFormData>();
  const selectedCountry = watch('organization.country');
  const departments = getDepartmentsByCountry(selectedCountry);

  // Reset department when country changes
  const handleCountryChange = (countryId: string, onChange: (value: string) => void) => {
    onChange(countryId);
    setValue('organization.department', '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium">Organization Details</h3>
          </div>

          <div className="space-y-6">
            {/* Organization Name */}
            <FormField
              control={control}
              name="organization.name"
              rules={{ required: 'Organization name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your organization name"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country Selection */}
            <FormField
              control={control}
              name="organization.country"
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    Country
                  </FormLabel>
                  <Select
                    onValueChange={(value) => handleCountryChange(value, field.onChange)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{country.flag === 'gb' ? '\u{1F1EC}\u{1F1E7}' : country.flag === 'de' ? '\u{1F1E9}\u{1F1EA}' : '\u{1F1E8}\u{1F1E6}'}</span>
                            {country.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department Selection */}
            <FormField
              control={control}
              name="organization.department"
              rules={{ required: 'Department is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Department
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedCountry}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={selectedCountry ? "Select your department" : "Select a country first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              Your organization will be set up with dedicated access to the Application Management System.
              Users you invite will inherit this organization&apos;s settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
