// src/app/dashboard/layout.tsx
import React from 'react';

// Import the common components for the dashboard layout
import SidebarNavigation from '@/components/dashboard/SidebarNavigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

// This layout component wraps all pages inside the /dashboard route segment
export default function DashboardLayout({
  children, // This prop represents the content of the specific dashboard page being viewed
}: {
  children: React.ReactNode;
}) {
  // console.log("Rendering DashboardLayout"); // Keep this for debugging if needed

  return (
    // Outer container using flexbox to position sidebar and main content
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900"> {/* Added dark mode background example */}

      {/* Sidebar Navigation (Persistent) */}
      <SidebarNavigation />

      {/* Main Content Area (Header + Page Content) */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Dashboard Header (Persistent) */}
        <DashboardHeader />

        {/* Scrollable Main Content Area for the specific page */}
        {/* The 'children' prop passed in is the actual page component */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}