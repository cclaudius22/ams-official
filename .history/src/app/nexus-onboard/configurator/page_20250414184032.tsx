// src/app/nexus-onboard/configurations/page.tsx
'use client'; 

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false (now allowed because this is a Client Component)
const ConfigurationManagement = dynamic(
  () => import('@/components/onboarding/ConfigurationManagement'), // Ensure this path is correct
  { ssr: false }
);

export default function ConfigurationsPage() {
  return (
    <div className="p-4 md:p-6"> {/* Added some padding */}

      {/* Render the dynamically imported client component */}
      <ConfigurationManagement />
    </div>
  );
}