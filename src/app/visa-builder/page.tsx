// src/app/visa-builder/page.tsx
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VisaBuilder from '@/components/visa-builder/VisaBuilder';

export default function VisaBuilderPage() {
  return (
    // Change h-screen to min-h-screen here
    <div className="flex min-h-screen bg-gray-100"> {/* <-- MODIFIED HERE */}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden"> {/* Keep overflow-hidden here */}
        <Header />
        {/* Ensure this main area handles its own scrolling */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <VisaBuilder />
        </main>
      </div>
    </div>
  );
}