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
  const [mfaStatus, setMfaStatus] = useState<'pending' | 'setup' | 'complete'>('pending');
  const [facialStatus, setFacialStatus] = useState<'pending' | 'scanning' | 'complete'>('pending');
  
  // Simulated MFA setup process
  const handleMfaSetup = () => {
    setMfaStatus('setup');
    // In real implementation, this would generate an actual secret and QR code
    setTimeout(() => {
      setMfaStatus('complete');
      setValue('biometrics.registered', true);
      setValue('biometrics.completedAt', new Date().toISOString());
      setValue('biometrics.methods', ['mfa', 'facial']);
    }, 3000);
  };
  
  // Simulated facial recognition process
  const handleFacialRegistration = () => {
    setFacialStatus('scanning');
    // Simulated scanning process
    setTimeout(() => {
      setFacialStatus('complete');
      setValue('biometrics.registered', true);
      setValue('biometrics.completedAt', new Date().toISOString());
      setValue('biometrics.methods', [...(watch('biometrics.methods') || []), 'facial']);
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

      {/* Updated Biometric/MFA Registration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Multi-Factor Authentication</h3>
            </div>
            {(mfaStatus === 'complete' && facialStatus === 'complete') && (
              <span className="flex items-center text-green-600">
                <Check className="mr-1 h-4 w-4" />
                Registered
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* MFA Authentication */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium flex items-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    MFA Application
                  </span>
                  {mfaStatus === 'complete' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                {mfaStatus === 'setup' && (
                  <div className="my-3 p-4 bg-gray-50 rounded-lg text-center">
                    <div className="border-2 border-dashed border-gray-300 p-2 mb-2 w-32 h-32 mx-auto flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Scan with authenticator app</p>
                    <p className="text-xs font-mono bg-gray-100 p-1 rounded">
                      ABCD-EFGH-IJKL-MNOP
                    </p>
                  </div>
                )}
                
                <Button
                  type="button"
                  className={`mt-2 w-full ${
                    mfaStatus === 'complete'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  onClick={handleMfaSetup}
                  disabled={mfaStatus === 'complete'}
                >
                  {mfaStatus === 'setup' ? 'Configuring...' : mfaStatus === 'complete' ? 'Configured' : 'Set Up MFA'}
                </Button>
                
                {mfaStatus === 'pending' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Set up authentication via Google Authenticator, Microsoft Authenticator, or similar app
                  </p>
                )}
              </div>
              
              {/* Facial Recognition (keep this as-is) */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium flex items-center">
                    <Scan className="h-4 w-4 mr-2" />
                    Facial Recognition
                  </span>
                  {facialStatus === 'complete' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                {facialStatus === 'scanning' && (
                  <div className="my-3 p-2 bg-gray-50 rounded-lg text-center">
                    <div className="border-2 border-dashed border-gray-300 p-2 mb-2 w-32 h-32 mx-auto flex items-center justify-center animate-pulse">
                      <Scan className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Scanning...</p>
                  </div>
                )}
                
                <Button
                  type="button"
                  className={`mt-2 w-full ${
                    facialStatus === 'complete'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  onClick={handleFacialRegistration}
                  disabled={facialStatus === 'complete'}
                >
                  {facialStatus === 'scanning' ? 'Scanning...' : facialStatus === 'complete' ? 'Registered' : 'Register Face'}
                </Button>
                
                {facialStatus === 'pending' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Register facial recognition for quick authentication
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center">
              <Lock className="h-4 w-4 text-blue-500 mr-2" />
              <p className="text-sm text-blue-700">
                Multi-factor authentication provides an additional layer of security and is required for all super admin accounts.
              </p>
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