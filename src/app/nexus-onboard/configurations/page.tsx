// app/nexus-onboard/configurations/page.tsx

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false to avoid client/server hydration issues
const ConfigurationManagement = dynamic(
  () => import('@/components/onboarding/ConfigurationManagement'),
  { ssr: false }
);

export default function ConfigurationsPage() {
  return (
    <main>
      <ConfigurationManagement />
    </main>
  );
}