// src/app/nexus-onboard/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

// This would be your RegistryInitializer logic
// You could also move this to a separate component if preferred
function useRegistryInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      // Dynamic import to ensure server-side compatibility
      import('@/components/onboarding/registry/registerFieldTypes')
        .then(module => {
          module.default();
          setIsInitialized(true);
          console.log('Onboarding field registry initialized');
        })
        .catch(err => {
          console.error('Failed to initialize field registry:', err);
        });
    }
  }, [isInitialized]);
  
  return isInitialized;
}

export default function NexusOnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize the registry
  useRegistryInitializer();
  
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