'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Splash from '@/components/splash';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState('super-admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1); // 1 for credentials, 2 for MFA
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for registration success message
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true);
      // Remove the query param from URL without refresh
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (step === 1) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Check if MFA is enabled
        if (data.user?.mfaEnabled) {
          setStep(2);
        } else {
          // No MFA, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      // MFA verification step
      // For now, simulate MFA verification
      // In production, this would verify the code against the user's MFA secret
      setTimeout(() => {
        if (mfaCode === '123456' || mfaCode.length === 6) {
          router.push('/dashboard');
        } else {
          setError('Invalid verification code');
        }
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Success Banner */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-b border-green-100 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                Organization created successfully! You can now sign in with your credentials.
              </span>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-400 hover:text-green-600 p-1 rounded-full hover:bg-green-100"
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
      )}

      {/* Announcement Banner */}
      {showBanner && !showSuccessMessage && (
        <div className="bg-blue-50 border-b border-blue-100 py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center text-sm text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 flex-shrink-0"
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
              <span className="flex-grow">Beta features are now available!</span>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-200 hover:bg-blue-100 whitespace-nowrap"
              >
                Enable now
              </Button>
              <button
                onClick={() => setShowBanner(false)}
                className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100"
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
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-10 lg:p-12">
            <div className="w-full max-w-sm mx-auto">
              {/* Logo */}
              <div className="mb-6 text-center md:text-left">
                <div className="inline-block">
                  <div className="font-bold text-2xl text-primary mb-1">Open Visa AMS</div>
                  <div className="h-1 w-20 bg-primary rounded mx-auto md:mx-0"></div>
                </div>
                <h1 className="text-xl font-semibold text-gray-800 mt-4">Sign in</h1>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Login Card */}
              <div className="p-1">
                {step === 1 ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Radio Group */}
                    <RadioGroup
                      value={userType}
                      onValueChange={setUserType}
                      className="space-y-2"
                    >
                      <Label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                        <RadioGroupItem value="super-admin" id="super-admin" />
                        <span className="font-medium text-sm">Super Admin User</span>
                      </Label>
                      <Label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                        <RadioGroupItem value="iam-user" id="iam-user" />
                        <span className="font-medium text-sm">IAM User</span>
                      </Label>
                    </RadioGroup>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-medium text-gray-600">
                        {userType === 'super-admin' ? 'Super Admin User Email' : 'IAM User Email'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10 text-sm"
                        disabled={loading}
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-gray-600">
                          Password
                        </Label>
                        <a href="#" className="text-xs text-primary hover:underline">
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
                        className="h-10 text-sm"
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <div className="text-sm font-medium mb-1 text-gray-700">
                        Multi-factor Authentication
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Enter the code from your authenticator app.
                      </p>
                    </div>

                    {/* MFA Code Input */}
                    <div className="space-y-1">
                      <Label htmlFor="mfa-code" className="text-xs font-medium text-gray-600">
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
                        disabled={loading}
                      />
                    </div>

                    {/* MFA Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 text-sm"
                        onClick={() => {
                          setStep(1);
                          setError(null);
                        }}
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 text-sm"
                        disabled={loading || mfaCode.length !== 6}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Create Organization Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  New organization?{' '}
                  <a href="/super-admin/create" className="text-primary hover:underline font-medium">
                    Set up your organization
                  </a>
                </p>
              </div>

              {/* Footer Text */}
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>By continuing, you agree to the Open Visa AMS Terms of Service.</p>
              </div>
            </div>
          </div>

          {/* Right Side - Splash Component */}
          <div className="hidden md:flex md:w-1/2">
            <Splash />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <div>&copy; 2025, Open Visa AMS. All rights reserved.</div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-700">
              Terms
            </a>
            <a href="#" className="hover:text-gray-700">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-700">
              Security
            </a>
            <a href="#" className="hover:text-gray-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
