'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with ssr:false option
const VisualConfigurator = dynamic(
  () => import('@/components/onboarding/configurator/VisualConfigurator'),
  { ssr: false }
);

// Loading component
const Loading = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-pulse text-xl font-medium">Loading configurator...</div>
  </div>
);

export default function ClientConfiguratorWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <VisualConfigurator />
    </Suspense>
  );
}