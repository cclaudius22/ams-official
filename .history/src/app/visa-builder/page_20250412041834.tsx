// src/app/visa-builder/page.tsx
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VisaBuilder from '@/components/visa-builder/VisaBuilder';


export default function VisaBuilderPage() {
  return (
    // Removed h-screen and added min-h-screen
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        {/* Removed overflow-x-hidden and overflow-y-auto */}
        <main className="flex-1 p-4 md:p-6">
          <VisaBuilder />
        </main>
      </div>
    </div>
  );
}
