// src/app/nexus-onboard/configurator/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import ConfiguratorBuilder from '@/components/onboarding/configurator/ConfiguratorBuilder';

export default function OnboardingConfiguratorPage() {
  const searchParams = useSearchParams();
  const configId = searchParams.get('id');
  
  return (
    <div className="space-y-4">
      <ConfiguratorBuilder configId={configId || undefined} />
    </div>
  );
}