// src/super-admin/create/page.tsx
'use client';

import React from 'react';
import { Metadata } from 'next';
import SuperAdminForm from './SuperAdminForm';

export const metadata: Metadata = {
  title: 'Create Super Admin Account',
  description: 'Create a new super administrator account with the required security clearances',
};

export default function CreateSuperAdminPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Super Admin Account</h1>
        <p className="text-muted-foreground mt-2">
          Create a new super administrator account with the required security clearances and access controls.
        </p>
      </div>
      
      <SuperAdminForm />
    </div>
  );
}