// app/nexus-onboard/visual-configurator/page.tsx

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false to avoid hydration issues with browser-specific APIs
const VisualConfigurator = dynamic(
  () => import('@/components/onboarding/configurator/VisualConfigurator'),
  { ssr: false }
);

export default function VisualConfiguratorPage() {
  return (
    <main>
      <VisualConfigurator />
    </main>
  );
}