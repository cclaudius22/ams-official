// app/knowledgebase/page.tsx
'use client';

import React from 'react';
import { RAGChat } from '@/components/knowledgebase/RAGChat';
import { Metadata } from 'next';



const KnowledgebasePage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UK Visa Knowledge Assistant</h1>
        <p className="text-gray-500">
          Get accurate information about UK visa types, requirements, and application procedures.
        </p>
      </div>
      
      <RAGChat />
      
      <div className="mt-8 text-sm text-gray-500">
        <p>
          This information is provided for guidance only and does not constitute legal advice. 
          For official information, please visit the UK government's official visa and immigration website.
        </p>
      </div>
    </div>
  );
};

export default KnowledgebasePage;