// src/super-admin/create/steps/IdentityGovernmentStep.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { 
  Users,
  Building,
  Globe,
  Shield
} from 'lucide-react';
import { SuperAdminFormData } from '../types';

export const IdentityGovernmentStep: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<SuperAdminFormData>();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Government Selection */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Globe className="mr-2 h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Government Authority</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="governmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Government</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Government" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HOME">Home Office</SelectItem>
                        <SelectItem value="FCO">Foreign Office</SelectItem>
                        <SelectItem value="MOD">Ministry of Defence</SelectItem>
                        <SelectItem value="TREASURY">Treasury</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Identity Information */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Users className="mr-2 h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Identity Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="personalDetails.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="personalDetails.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="personalDetails.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        {...field} 
                        placeholder="name@department.gov.uk" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="personalDetails.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Phone</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        {...field} 
                        placeholder="+44 123 456 7890" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Initial Verification */}
          <div>
            <div className="flex items-center mb-4">
              <Shield className="mr-2 h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Initial Verification</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="personalDetails.employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="personalDetails.positionTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};