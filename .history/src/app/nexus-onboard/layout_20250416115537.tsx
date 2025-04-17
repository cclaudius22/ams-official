// src/app/nexus-onboard/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

// Registry initializer hook
function useRegistryInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      // Dynamically import and initialize the registry
     
        .then(module => {
          module.default();
          setIsInitialized(true);
          console.log('Onboarding field registry initialized with identity and basic fields');
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