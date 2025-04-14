// src/components/onboarding/configurator/ClientConfiguratorWrapper.tsx
'use client'; // <-- Essential: Marks this as a Client Component

import { useSearchParams } from 'next/navigation';
import ConfiguratorBuilder from './ConfiguratorBuilder'; // Import the main builder UI
import React from 'react'; // Import React if using JSX fragments or other React features directly

export default function ClientConfiguratorWrapper() {
  // useSearchParams can ONLY be used in Client Components
  const searchParams = useSearchParams();
  const configId = searchParams.get('id');

  // Render the ConfiguratorBuilder, passing the configId
  // ConfiguratorBuilder handles fetching data based on the ID and setting up its context
  return (
      <ConfiguratorBuilder configId={configId || undefined} />
  );
}