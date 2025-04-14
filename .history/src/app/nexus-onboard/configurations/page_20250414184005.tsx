// app/nexus-onboard/configurations/page.tsx
'use client'; // <--- ADD THIS DIRECTIVE AT THE VERY TOP

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false (now allowed because this is a Client Component)
const ConfigurationManagement = dynamic(
  () => import('@/components/onboarding/ConfigurationManagement'), // Make sure this path is correct
  { ssr: false }
);

export default function ConfigurationsPage() {
  return (
    // Using <main> is fine, maybe add some padding for layout
    <main className="p-4 md:p-6">
      {/* Optionally add a title */}
      {/* <h1 className="text-2xl font-semibold mb-4">Onboarding Configurations</h1> */}
      <ConfigurationManagement />
    </main>
  );
}