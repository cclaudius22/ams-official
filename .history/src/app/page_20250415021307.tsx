'use client';

import React, { useState } from 'react';
// import Image from 'next/image'; // No longer used directly here
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import Splash from '@/components/splash'; 

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState('super-admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1); // 1 for credentials, 2 for MFA
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true); // State to control banner visibility

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (step === 1) {
      // Simulate validation and move to MFA step
      console.log('Attempting login with:', { userType, email }); // Debug log
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } else {
      // Simulate login and redirect
      console.log('Attempting MFA verification with code:', mfaCode); // Debug log
      setTimeout(() => {
        router.push('/dashboard'); // Redirect to dashboard after successful MFA
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Moved bg-gray-50 here */}
      {/* Announcement Banner */}
      {showBanner && ( // Conditionally render the banner
        <div className="bg-blue-50 border-b border-blue-100 py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center text-sm text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 flex-shrink-0" // Added flex-shrink-0
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
              <span className="flex-grow"> {/* Added flex-grow */}
                Beta features are now available!
              </span>
            </div>
            <div className="flex items-center space-x-2 ml-4"> {/* Added wrapper for buttons */}
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-100 whitespace-nowrap">
                    Enable now
                </Button>
                <button
                    onClick={() => setShowBanner(false)} // Add onClick to hide banner
                    className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100" // Added padding and hover bg
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
        {/* Changed max-w-6xl to max-w-5xl for slightly narrower overall container */}
        {/* Added shadow-xl and rounded-lg for better visual separation */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch bg-white shadow-xl rounded-lg overflow-hidden">

          {/* Left Side - Login Form */}
          {/* Adjusted padding and width constraints */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-10 lg:p-12">
             {/* Centering container with max-width for the form itself */}
             <div className="w-full max-w-sm mx-auto"> {/* Reduced max-w for narrower form */}
                {/* Logo */}
                <div className="mb-6 text-center md:text-left"> {/* Centered on small screens */}
                    <div className="inline-block"> {/* Inline block for centering */}
                        <div className="font-bold text-2xl text-primary mb-1">
                        Open Visa AMS
                        </div>
                        <div className="h-1 w-20 bg-primary rounded mx-auto md:mx-0"></div> {/* Centered line */}
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800 mt-4">Sign in</h1>
                </div>

                {/* Login Card - Removed Card component for a flatter look, applied styles directly */}
                <div className="p-1"> {/* Reduced padding */}
                {step === 1 ? (
                    <form onSubmit={handleLogin} className="space-y-5"> {/* Increased spacing */}
                    {/* Radio Group - Simplified styling */}
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
                        className="h-10 text-sm" // Adjusted size
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-gray-600">
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
                        className="h-10 text-sm" // Adjusted size
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full mt-6" // Added more top margin
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Next'}
                    </Button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-5"> {/* Increased spacing */}
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
                        className="h-10 text-center font-mono text-lg tracking-widest" // Kept larger for MFA
                        maxLength={6}
                        />
                    </div>

                    {/* MFA Buttons */}
                    <div className="flex space-x-3 pt-2"> {/* Added padding top */}
                        <Button
                        type="button"
                        variant="outline"
                        className="flex-1 text-sm"
                        onClick={() => setStep(1)}
                        disabled={loading}
                        >
                        Back
                        </Button>
                        <Button
                        type="submit"
                        className="flex-1 text-sm"
                        disabled={loading || mfaCode.length !== 6}
                        >
                        {loading ? 'Verifying...' : 'Sign In'}
                        </Button>
                    </div>
                    </form>
                )}
                </div>

               

                {/* Footer Text */}
                <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>By continuing, you agree to the Open Visa AMS Terms of Service.</p>
                </div>
            </div> {/* End of max-w-sm container */}
          </div>

          {/* Right Side - Splash Component */}
          {/* Ensure it takes remaining width on md screens and is hidden on small screens */}
          <div className="hidden md:flex md:w-1/2">
            {/* The Splash component now handles the content and styling */}
            <Splash />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4"> {/* Adjusted background */}
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <div>© 2025, Open Visa AMS. All rights reserved.</div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-700">Terms</a>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Security</a>
            <a href="#" className="hover:text-gray-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}