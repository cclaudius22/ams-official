// src/app/visa-builder/page.tsx
'use client'; // Still needed as VisaBuilder and its children use client features

import React from 'react';
import Header from '@/components/layout/Header'; // Adjust path if needed (create this component)
import Sidebar from '@/components/layout/Sidebar'; // Adjust path if needed (create this component)
import VisaBuilder from '@/components/visa-builder/VisaBuilder'; // Adjust path if needed

export default function VisaBuilderPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar specific to this page/section */}
      <Sidebar /> {/* Render the Sidebar component */}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header specific to this page/section */}
        <Header /> {/* Render the Header component */}

        {/* Page Content (VisaBuilder) */}
        {/* Use <main> for the scrollable content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <VisaBuilder /> {/* Render the main builder component */}
        </main>
      </div>
    </div>
  );
}