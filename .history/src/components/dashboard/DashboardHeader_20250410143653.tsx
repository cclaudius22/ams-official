// src/components/dashboard/DashboardHeader.tsx
'use client'; // Needed for useState and potentially event handlers

import React, { useState } from 'react'; // Added useState for availability toggle example
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, ArrowLeft, CheckCircle2, XCircle, Settings } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { usePathname } from 'next/navigation'; // To conditionally show back button

interface DashboardHeaderProps {
  // Props to customize header content if needed later
  // userName?: string;
  // userRole?: string;
}

export default function DashboardHeader({}: DashboardHeaderProps) {
  const pathname = usePathname();
  // Example state for availability - move to global state/context later if needed across app
  const [availableForTasks, setAvailableForTasks] = useState(true);

  // Determine if we are on a specific application review page to show back button
  // This logic might need adjustment based on your exact routes
  const isReviewPage = pathname.includes('/dashboard/reviewer/') && !pathname.endsWith('/queue') && pathname.split('/').length > 3; // Basic check

  return (
    <div className="sticky top-0 z-20 bg-white border-b">
      <div className="flex justify-between items-center px-4 md:px-6 py-3">
        {/* Left Side: Logo and Title */}
        <div className="flex items-center">
          {isReviewPage ? (
            <Link href="/dashboard/reviewer/queue" passHref>
              <Button variant="ghost" size="sm" className="mr-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Queue
              </Button>
            </Link>
          ) : (
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="relative h-10 w-10 mr-3">
                  <Image 
                    src="/logo/ov_logo.png" 
                    alt="OpenVisa Logo" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 drop-shadow-sm">
                  AMS
                </h1>
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Icons & Availability */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] bg-red-500 rounded-full text-white flex items-center justify-center border border-white">3</span>
             <span className="sr-only">Notifications</span>
          </button>
          <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] bg-blue-500 rounded-full text-white flex items-center justify-center border border-white">5</span>
             <span className="sr-only">Messages</span>
          </button>
          <UserProfileDropdown 
            userName="Rachel Johnson"
            userEmail="rachel.johnson@example.gov.uk"
            userInitials="RJ"
          />
           {/* Availability Toggle - Example Implementation */}
           <Button
             variant="outline"
             size="sm"
             className={`flex items-center space-x-1.5 rounded-full h-8 text-xs ${
               availableForTasks
                 ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                 : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
             }`}
             onClick={() => setAvailableForTasks(!availableForTasks)}
           >
             {availableForTasks ? (
               <CheckCircle2 className="h-3.5 w-3.5" />
             ) : (
               <XCircle className="h-3.5 w-3.5" />
             )}
             <span className="hidden sm:inline"> {/* Hide text on very small screens */}
               {availableForTasks ? 'Available' : 'Unavailable'}
             </span>
           </Button>
           
        </div>
      </div>
    </div>
  );
}
