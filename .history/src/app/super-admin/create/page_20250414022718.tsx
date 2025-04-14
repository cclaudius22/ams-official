// src/super-admin/create/page.tsx
'use client';

import React from 'react';
import SuperAdminForm from './SuperAdminForm';

export default function CreateSuperAdminPage() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Super Admin Account</h1>
      <SuperAdminForm />
    </div>
  );
}