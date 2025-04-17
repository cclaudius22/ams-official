// Example for ID Verification Field
// src/components/onboarding/field-types/identity/IdentityDocumentScan.tsx

// 1. Configurator Component - Used in the builder UI
export const IdentityDocumentScanConfigurator = (props) => {
  // UI for configuring ID verification settings
  // Properties like document types to accept, verification level, etc.
  return (/* Configuration UI */);
};

// 2. Form Component - Used in the actual onboarding form
export const IdentityDocumentScanField = (props) => {
  // Interactive component for document scanning
  // Has states for: idle, scanning, processing, verified, error
  return (/* Complex document scanning UI */);
};

// 3. Preview Component - Simplified version for preview mode
export const IdentityDocumentScanPreview = (props) => {
  // Simplified, non-interactive preview
  return (/* Preview UI that shows what the component would look like */);
};