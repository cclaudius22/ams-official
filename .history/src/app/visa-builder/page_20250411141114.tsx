// src/app/visa-builder/page.tsx
'use client'; // Required because VisaBuilder uses hooks (useState, useEffect, etc.)

import React from 'react';
import VisaBuilder from '@/components/visa-builder/VisaBuilder'; // Adjust the import path if your components folder is different

export default function VisaBuilderPage() {
  return (
    // Using <main> for semantic structure and adding padding
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/*
        You could add a specific page heading here if you don't have
        one handled in a layout component that wraps this page.
        Example:
        <h1 className="text-3xl font-bold mb-6">Configure New Visa Type</h1>
      */}

      {/* Render the main builder component */}
      <VisaBuilder />

    </main>
  );
}