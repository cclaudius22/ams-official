// src/components/onboarding/configurator/ConfigurationDetailsForm.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useConfigurator } from '@/contexts/ConfiguratorContext';

const ConfigurationDetailsForm = () => {
  const { state, dispatch } = useConfigurator();
  const { configuration } = state;

  // Helper to dispatch updates
  const handleChange = (field: keyof typeof configuration, value: any) => {
    dispatch({ type: 'UPDATE_CONFIG_DETAIL', payload: { field, value } });
  };

  // Generate key from name (simple example)
  const generateKeyFromName = (name: string) => {
      return name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
          .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      handleChange('name', newName);
      // Auto-update key only if it's currently empty or matches the auto-generated key of the *previous* name
      // This prevents overriding a manually set key unintentionally.
      const oldKey = generateKeyFromName(configuration.name); // Key based on *current* state name before update
      if (!configuration.key || configuration.key === oldKey) {
        handleChange('key', generateKeyFromName(newName));
      }
  }

  return (
    <Card className="max-w-4xl mx-auto"> {/* Limit width for better readability */}
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Define the core properties of this onboarding configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6"> {/* Increased spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Responsive grid */}
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name*</Label>
            <Input
              id="name"
              value={configuration.name}
              onChange={handleNameChange}
              placeholder="e.g., Standard Employee Onboarding"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Configuration Key*</Label>
            <Input
              id="key"
              value={configuration.key}
              onChange={(e) => handleChange('key', e.target.value)}
              placeholder="e.g., employee-standard-v1"
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique system ID (lowercase, hyphens). Auto-generated from name if empty.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="targetUserType">Target User Type*</Label>
            <Select
              value={configuration.targetUserType}
              onValueChange={(value) => handleChange('targetUserType', value)}
              required
            >
              <SelectTrigger id="targetUserType">
                <SelectValue placeholder="Select user type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="super-admin">Super Administrator</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
                {/* Add more roles as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetOrgType">Target Organization Type*</Label>
            <Select
              value={configuration.targetOrgType}
              onValueChange={(value) => handleChange('targetOrgType', value)}
              required
            >
              <SelectTrigger id="targetOrgType">
                <SelectValue placeholder="Select organization type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="all">All Organizations</SelectItem>
                 {/* Add more types as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="version">Version*</Label>
            <Input
              id="version"
              type="number"
              min="1"
              value={configuration.version} // No need for toString() here
              onChange={(e) => handleChange('version', parseInt(e.target.value) || 1)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityLevel">Security Level*</Label>
            <Select
              value={configuration.securityLevel}
              onValueChange={(value) => handleChange('securityLevel', value)}
              required
            >
              <SelectTrigger id="securityLevel">
                <SelectValue placeholder="Select security level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
                <SelectItem value="high">High</SelectItem>
                 {/* Add more levels as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4"> {/* Add padding top */}
          <Checkbox
            id="isActive"
            checked={configuration.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked === true)} // Ensure boolean value
          />
          <Label htmlFor="isActive" className="font-normal cursor-pointer leading-snug"> {/* Adjust line height */}
            Set as active configuration <br/>
            <span className="text-xs text-muted-foreground">
                (Only one configuration can be active per User/Org type combination)
             </span>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationDetailsForm;