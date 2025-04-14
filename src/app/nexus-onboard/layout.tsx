// src/app/nexus-onboard/layout.tsx
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function NexusOnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}