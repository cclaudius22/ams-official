// app/nexus-onboard/visual-configurator/page.tsx
import ClientConfiguratorWrapper from '@/components/onboarding/configurator/ClientConfiguratorWrapper'; // Import the client wrapper
import { Suspense } from 'react'; // Optional: Add suspense for better loading UX

export default function VisualConfiguratorPage() {
  // This page remains a Server Component.
  // It renders the Client Wrapper, which handles client-side logic.
  // The wrapper might internally fetch data or receive it via props if needed later.

  // Example searchParams handling if needed server-side (less common for this builder usually)
  // const configId = searchParams?.id;

  return (
      <Suspense fallback={<div>Loading Builder...</div>}> {/* Optional loading UI */}
        {/* Pass configId down if fetched server-side or determined here */}
         <ClientConfiguratorWrapper />
       </Suspense>
  );
}