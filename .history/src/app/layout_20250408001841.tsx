// src/app/dashboard/layout.tsx
import React from 'react';
import SidebarNavigation from '@/components/dashboard/SidebarNavigation'; 
import DashboardHeader from '@/components/dashboard/DashboardHeader'; // Import the new header

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100"> {/* Use a slightly off-white background */}
      <SidebarNavigation /> {/* Render the persistent sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden"> {/* Main content area */}
        <DashboardHeader /> {/* Render the persistent header */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6"> {/* Scrollable content area with padding */}
          {children} {/* The actual page content goes here */}
        </main>
      </div>
    </div>
  );
}