'use client'

import React from 'react';

const VisaBuilder = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Visa Builder</h1>
          <p className="text-gray-500">Configure visa requirements and application flow</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Basic Info */}
        <div className="w-full lg:w-1/3">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Visa Type Configuration</h2>
            {/* Placeholder for form fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Visa Name</label>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <div className="h-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Application Flow */}
        <div className="w-full lg:w-2/3">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Application Flow Builder</h2>
            {/* Placeholder for stages */}
            <div className="space-y-4">
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaBuilder;
