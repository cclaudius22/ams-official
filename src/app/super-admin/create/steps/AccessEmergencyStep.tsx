// src/super-admin/create/steps/AccessEmergencyStep.tsx
import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle,
  Users,
  Shield,
  Clock,
  Lock,
  Network,
  Phone,
  Mail,
  Info,
  Check,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { SuperAdminFormData } from '../types';

export const AccessEmergencyStep: React.FC = () => {
  const { control, watch, setValue, formState: { errors } } = useFormContext<SuperAdminFormData>();
  const [backupVerified, setBackupVerified] = useState(false);
  
  // Setup field array for IP addresses
  const { fields, append, remove } = useFieldArray({
    control,
    name: "access.allowedIPs"
  });

  const handleVerifyBackup = () => {
    const primaryAdmin = watch('backup.primaryAdmin');
    if (primaryAdmin) {
      // Simulate verification process
      setTimeout(() => {
        setValue('backup.verified', true);
        setBackupVerified(true);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup Super Admin Assignment */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Users className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Backup Administrator Assignment</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="backup.primaryAdmin"
                rules={{ required: "Primary backup admin is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Backup Admin</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Search by employee ID..."
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVerifyBackup}
                        disabled={!field.value || backupVerified}
                      >
                        {backupVerified ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="backup.secondaryAdmin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Backup Admin (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Search by employee ID..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">
                  Backup administrators must have DV clearance and be from different departments.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Emergency Protocols</h3>
          </div>

          <div className="space-y-4">
            {/* Emergency Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="emergency.phone"
                rules={{ required: "Emergency phone is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        placeholder="+44 7xxx xxxxxx"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="emergency.email"
                rules={{ required: "Emergency email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secure Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="secure@gov.uk"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Emergency Levels */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Emergency Access Levels</h4>
              {['BRONZE', 'SILVER', 'GOLD'].map((level) => (
                <div key={level} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{level} Protocol</p>
                      <p className="text-sm text-gray-500">
                        {level === 'BRONZE' && 'System level emergency access (4 hours)'}
                        {level === 'SILVER' && 'Enhanced emergency access (12 hours)'}
                        {level === 'GOLD' && 'Critical emergency access (24 hours)'}
                      </p>
                    </div>
                  </div>
                  <FormField
                    control={control}
                    name="emergency.levels"
                    render={({ field }) => (
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(level)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const updated = checked
                              ? [...current, level]
                              : current.filter((l) => l !== level);
                            field.onChange(updated);
                          }}
                        />
                      </FormControl>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Restrictions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Lock className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Access Restrictions</h3>
          </div>

          <div className="space-y-4">
            {/* IP Restrictions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Allowed IP Ranges</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append('')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add IP Range
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`access.allowedIPs.${index}`}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="192.168.1.0/24"
                          />
                        </FormControl>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="text-sm text-muted-foreground italic">
                    No IP ranges added. Add at least one IP range.
                  </div>
                )}
              </div>
            </div>

            {/* Time Restrictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={control}
                name="access.workHours.start"
                rules={{ required: "Start time is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Hours Start</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="access.workHours.end"
                rules={{ required: "End time is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Hours End</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Restrictions */}
            <div className="mt-4">
              <FormField
                control={control}
                name="access.allowedLocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Locations</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const current = field.value || [];
                        if (!current.includes(value)) {
                          field.onChange([...current, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Add allowed location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HQ">Headquarters</SelectItem>
                        <SelectItem value="DC1">Data Center 1</SelectItem>
                        <SelectItem value="DC2">Data Center 2</SelectItem>
                        <SelectItem value="RO">Regional Office</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-2 space-y-1">
                {watch('access.allowedLocations')?.map((location) => (
                  <div key={location} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                    <span>{location}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const current = watch('access.allowedLocations') || [];
                        setValue(
                          'access.allowedLocations',
                          current.filter((l) => l !== location)
                        );
                      }}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                Access restrictions are enforced at all times unless emergency protocols are activated.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};