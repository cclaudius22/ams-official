// src/super-admin/create/steps/SecurityClearanceStep.tsx
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield,
  Fingerprint,
  Laptop,
  Smartphone,
  Lock,
  AlertTriangle,
  Check
} from 'lucide-react';
import { SuperAdminFormData } from '../types';

export const SecurityClearanceStep: React.FC = () => {
  const { control, setValue, watch } = useFormContext<SuperAdminFormData>();
  const [biometricStatus, setBiometricStatus] = useState<'pending' | 'scanning' | 'complete'>('pending');
  
  const biometrics = watch('biometrics');

  const handleBiometricRegistration = () => {
    setBiometricStatus('scanning');
    // Simulated biometric registration
    setTimeout(() => {
      setBiometricStatus('complete');
      setValue('biometrics.registered', true);
      setValue('biometrics.completedAt', new Date().toISOString());
      setValue('biometrics.methods', ['fingerprint', 'facial']);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Security Clearance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Shield className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Security Clearance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="clearance.level"
              rules={{ required: "Clearance level is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clearance Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CTC">Counter Terrorist Check (CTC)</SelectItem>
                      <SelectItem value="SC">Security Check (SC)</SelectItem>
                      <SelectItem value="DV">Developed Vetting (DV)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="clearance.authority"
              rules={{ required: "Vetting authority is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vetting Authority</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Authority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UKSV">UK Security Vetting (UKSV)</SelectItem>
                      <SelectItem value="MOD">Ministry of Defence</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="clearance.number"
              rules={{ required: "Clearance number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clearance Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SC-12345-XYZ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="clearance.expiryDate"
              rules={{ required: "Expiry date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="clearance.vettingDetails.vettingReference"
              rules={{ required: "Vetting reference is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vetting Reference</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VET-12345-XYZ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="clearance.vettingDetails.vettingAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vetting Authority</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Biometric Registration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Fingerprint className="mr-2 h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Biometric Registration</h3>
            </div>
            {biometricStatus === 'complete' && (
              <span className="flex items-center text-green-600">
                <Check className="mr-1 h-4 w-4" />
                Registered
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {['Fingerprint', 'Facial Recognition'].map((method) => (
                <div key={method} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{method}</span>
                    {biometricStatus === 'complete' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <Button
                    type="button"
                    className={`mt-2 w-full ${
                      biometricStatus === 'complete'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    onClick={handleBiometricRegistration}
                    disabled={biometricStatus === 'complete'}
                  >
                    {biometricStatus === 'scanning' ? 'Scanning...' : 'Register'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Registration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Laptop className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Device Registration</h3>
          </div>

          <div className="space-y-4">
            {/* Trusted Workstation */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Laptop className="mr-2 h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">Trusted Workstation</h4>
                    <p className="text-sm text-gray-500">Register your secure workstation</p>
                  </div>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setValue('devices.workstation', {
                      id: `WS-${Math.floor(Math.random() * 10000)}`,
                      deviceName: 'Workstation',
                      deviceType: 'workstation',
                      registered: true,
                      registeredAt: new Date().toISOString()
                    });
                  }}
                  disabled={!!watch('devices.workstation')}
                >
                  {watch('devices.workstation') ? 'Registered' : 'Register Device'}
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                <p>Requirements:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Encrypted hard drive</li>
                  <li>Latest security patches</li>
                  <li>Approved security software</li>
                </ul>
              </div>
            </div>

            {/* Security Token */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">Hardware Security Token</h4>
                    <p className="text-sm text-gray-500">Register your security key</p>
                  </div>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setValue('devices.securityToken', {
                      id: `TK-${Math.floor(Math.random() * 10000)}`,
                      deviceName: 'Security Token',
                      deviceType: 'token',
                      registered: true,
                      registeredAt: new Date().toISOString()
                    });
                  }}
                  disabled={!!watch('devices.securityToken')}
                >
                  {watch('devices.securityToken') ? 'Registered' : 'Register Token'}
                </Button>
              </div>
            </div>

            {/* Mobile Device */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Smartphone className="mr-2 h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">Mobile Device</h4>
                    <p className="text-sm text-gray-500">Register your authorized mobile device</p>
                  </div>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setValue('devices.mobileDevice', {
                      id: `MOB-${Math.floor(Math.random() * 10000)}`,
                      deviceName: 'Mobile Device',
                      deviceType: 'mobile',
                      registered: true,
                      registeredAt: new Date().toISOString()
                    });
                  }}
                  disabled={!!watch('devices.mobileDevice')}
                >
                  {watch('devices.mobileDevice') ? 'Registered' : 'Register Mobile'}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                All devices must meet security standards. Maximum of 3 devices can be registered per user.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};