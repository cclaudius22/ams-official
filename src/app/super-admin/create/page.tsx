// src/app/super-admin/create/page.tsx
'use client';

import React from 'react';
import SuperAdminForm from './SuperAdminForm';

export default function CreateSuperAdminPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Super Admin Account</h1>
        <p className="text-muted-foreground mt-2">
          Create a new super administrator account with the required security clearances and access controls.
        </p>
      </div>
      
      <SuperAdminForm />
    </>
  );
}