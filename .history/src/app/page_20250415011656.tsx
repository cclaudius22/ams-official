// app/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState('super-admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1); // 1 for credentials, 2 for MFA
  const [loading, setLoading] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (step === 1) {
      // Simulate validation and move to MFA step
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } else {
      // Simulate login and redirect
      setTimeout(() => {
        router.push('/dashboard');
        setLoading(false);
      }, 800);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Banner (like AWS has) */}
      <div className="bg-blue-50 border-b border-blue-100 py-3 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center text-sm text-blue-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span>Try the new AI-powered processing interface. Faster approvals, enhanced security.</span>
          </div>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-100">
            Enable now
          </Button>
          <button 
            className="absolute right-2 top-2 text-blue-400 hover:text-blue-600"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-stretch">
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 p-6">
            <div className="mb-8">
              {/* Logo placeholder - replace with your actual logo */}
              <div className="mb-4">
                <div className="font-bold text-2xl text-primary mb-1">
                  Open Visa AMS
                </div>
                <div className="h-1 w-20 bg-primary rounded"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Sign in</h1>
            </div>
            
            <Card className="p-6 shadow-md border-gray-200">
              {step === 1 ? (
                <form onSubmit={handleLogin}>
                  <RadioGroup 
                    value={userType} 
                    onValueChange={setUserType}
                    className="mb-6 space-y-3"
                  >
                    <div className="flex items-start space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="super-admin" id="super-admin" className="mt-1" />
                      <div className="grid gap-1 flex-1">
                        <Label 
                          htmlFor="super-admin" 
                          className="font-medium cursor-pointer"
                        >
                          Super Admin User
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          System administrator with complete access to all features and settings.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="iam-user" id="iam-user" className="mt-1" />
                      <div className="grid gap-1 flex-1">
                        <Label 
                          htmlFor="iam-user" 
                          className="font-medium cursor-pointer"
                        >
                          IAM User
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          User with specific permissions assigned by administrators.
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {userType === 'super-admin' ? 'Super Admin User Email' : 'IAM User Email'}
                      </Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        <a 
                          href="#" 
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input 
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Next'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Multi-factor Authentication Required
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter the verification code from your authentication app
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="mfa-code" className="text-sm font-medium">
                        Verification Code
                      </Label>
                      <Input 
                        id="mfa-code"
                        placeholder="6-digit code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        required
                        className="h-10 text-center font-mono text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-1" 
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={loading || mfaCode.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
            
            <div className="mt-6">
              <Separator className="my-4">
                <span className="px-2 text-xs text-muted-foreground bg-gray-50">New to Open Visa AMS?</span>
              </Separator>
              
              <Button variant="outline" className="w-full">
                Request an account
              </Button>
            </div>
            
            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>By continuing, you agree to the Open Visa AMS Terms of Service.</p>
              <p className="mt-1">This site uses essential cookies for authentication and security purposes.</p>
            </div>
          </div>
          
          {/* Right Side - Banner */}
          <div className="hidden w-full md:flex md:w-1/2 rounded-lg overflow-hidden">
            <div className="w-full relative bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center items-center p-10 text-white">
              <div className="absolute inset-0 bg-[url('/ams-pattern.svg')] opacity-10"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Logo placeholder - replace with your actual logo */}
                <div className="mb-8 bg-white/10 p-6 rounded-full">
                  <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold">AMS</span>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">Open Visa AMS</h2>
                <p className="text-xl mb-6 text-blue-100">AI-Driven Next-Gen Visa Management</p>
                
                <div className="max-w-md">
                  <ul className="space-y-3 text-left">
                    <li className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2 text-blue-200" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span>AI-powered processing and risk assessment</span>
                    </li>
                    <li className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2 text-blue-200" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span>Secure document verification with biometrics</span>
                    </li>
                    <li className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2 text-blue-200" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span>Streamlined case management & automation</span>
                    </li>
                    <li className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2 text-blue-200" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span>Comprehensive compliance & audit trails</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <div>© 2025, Open Visa AMS. All rights reserved.</div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-700">Terms of Service</a>
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700">Security</a>
            <a href="#" className="hover:text-gray-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}