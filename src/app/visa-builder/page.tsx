// src/app/visa-builder/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VisaBuilder from '@/components/visa-builder/VisaBuilder';
import JsonVisaImporter from '@/components/visa-builder/JsonVisaImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileJson } from 'lucide-react';

export default function VisaBuilderPage() {
  const [activeMode, setActiveMode] = useState<'wizard' | 'json'>('json');

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'wizard' | 'json')}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Visa Type Configuration</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Create and manage visa type configurations for the processing system
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON Import
                </TabsTrigger>
                <TabsTrigger value="wizard" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Visual Wizard
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="json" className="mt-0">
              <JsonVisaImporter />
            </TabsContent>

            <TabsContent value="wizard" className="mt-0">
              <VisaBuilder />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
