// src/components/onboarding/renderer/fields/MockFileUpload.tsx
'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card'; // Use card for visual structure
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // If type selection needed
import { UploadCloud, FileCheck, CircleAlert } from "lucide-react";
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

// Add specific config structure to FieldConfig type if needed
// interface FieldConfig {
//   // ... other properties
//   config?: {
//      allowedDocumentTypes?: string[]; // e.g., ['utility_bill', 'bank_statement']
//      // ... other file upload configs like maxSize, formats
//   }
// }

interface MockFileUploadProps {
  fieldConfig: FieldConfig & { config?: { allowedDocumentTypes?: string[] } };
  // No 'control' or 'errorMessage' needed for this pure mock currently,
  // but RHF state will be updated manually via setValue.
}

const MockFileUpload = ({ fieldConfig }: MockFileUploadProps) => {
  const { fieldName, label, isRequired, config } = fieldConfig;
  const allowedTypes = config?.allowedDocumentTypes || []; // Get allowed types from config

  // Get setValue from RHF to update form state manually for the mock
  const { setValue, getValues } = useFormContext();

  // Local state for mock UI feedback
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [mockFileName, setMockFileName] = useState<string>('');

  // Determine if document type selection is needed
  const needsTypeSelection = allowedTypes.length > 0;

  // Handle mock file selection/upload
  const handleMockUpload = () => {
    if (needsTypeSelection && !selectedDocType) {
       alert("Please select a document type first.");
       return;
    }

    setUploadStatus('uploading');
    const fileName = `mock_${selectedDocType || 'document'}_${Date.now()}.pdf`;
    setMockFileName(fileName);

    // Simulate upload delay
    setTimeout(() => {
      setUploadStatus('success');
      // Update RHF form state for this field with mock data
      setValue(
         fieldName, // e.g., "documents.proofOfAddress"
         {
            status: 'mock_uploaded',
            fileName: fileName,
            documentType: selectedDocType || 'generic', // Store selected type
            uploadedAt: new Date().toISOString()
         },
         { shouldValidate: true, shouldDirty: true } // Trigger validation and mark form as dirty
      );
    }, 1500); // 1.5 second delay
  };

  const handleReset = () => {
     setUploadStatus('idle');
     setMockFileName('');
     setSelectedDocType(needsTypeSelection ? '' : selectedDocType); // Reset select only if it exists
     // Reset RHF form state for this field
     setValue(fieldName, null, { shouldValidate: true, shouldDirty: true });
  }

  // Get current value from RHF to potentially display existing status
  // Note: This might cause re-renders, use cautiously or based on status only
  // const currentFieldValue = getValues(fieldName);
  // useEffect(() => {
  //   if (currentFieldValue?.status === 'mock_uploaded') {
  //     setUploadStatus('success');
  //     setMockFileName(currentFieldValue.fileName);
  //     setSelectedDocType(currentFieldValue.documentType);
  //   }
  // }, [currentFieldValue]);

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName + '-trigger'}> {/* Point label to the trigger element */}
        {label || fieldName}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Card className="p-4">
        <CardContent className="p-0 space-y-4">
           {/* Document Type Selection (if applicable) */}
          {needsTypeSelection && uploadStatus !== 'success' && (
             <div className='space-y-1'>
                <Label htmlFor={fieldName + '-doc-type'} className="text-xs font-medium">Document Type</Label>
                <Select
                   value={selectedDocType}
                   onValueChange={setSelectedDocType}
                   required={isRequired} // Mark select as required if main field is
                >
                   <SelectTrigger id={fieldName + '-doc-type'}>
                      <SelectValue placeholder="Select document type..." />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="" disabled>Select document type...</SelectItem>
                     {allowedTypes.map(docType => (
                       <SelectItem key={docType} value={docType}>
                         {/* Simple display - could map keys to user-friendly names later */}
                         {docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                       </SelectItem>
                     ))}
                   </SelectContent>
                </Select>
             </div>
          )}

          {/* Mock Upload Area / Status Display */}
          {uploadStatus === 'idle' && (
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center space-y-2">
              <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {needsTypeSelection ? 'Select type above and then ' : ''}Click button to simulate upload
              </p>
              <Button
                 id={fieldName + '-trigger'} // Target for the main label
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={handleMockUpload}
                 disabled={needsTypeSelection && !selectedDocType}
              >
                 Simulate File Upload
              </Button>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-center text-blue-700">
              Simulating upload... please wait.
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-2">
               <div className='flex items-center text-green-700'>
                   <FileCheck className="h-5 w-5 mr-2 flex-shrink-0" />
                   <p className="text-sm font-medium">Mock Upload Successful</p>
               </div>
               <p className="text-xs text-muted-foreground pl-7 break-all">File: {mockFileName}</p>
               {needsTypeSelection && selectedDocType && (
                   <p className="text-xs text-muted-foreground pl-7">Type: {selectedDocType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
               )}
               <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 pl-7 text-xs text-destructive">
                   Replace/Remove Mock File
                </Button>
            </div>
          )}

          {/* Add error state if needed */}
           {uploadStatus === 'error' && (
              <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4 space-y-2">
                  <div className='flex items-center text-destructive'>
                     <CircleAlert className="h-5 w-5 mr-2 flex-shrink-0" />
                     <p className="text-sm font-medium">Mock Upload Failed</p>
                  </div>
                   <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 pl-7 text-xs">
                      Try again
                   </Button>
              </div>
            )}

        </CardContent>
      </Card>

      {/* Display Help Text if provided */}
      {fieldConfig.helpText && (
         <p className="text-xs text-muted-foreground pt-1">{fieldConfig.helpText}</p>
      )}
      {/* Error Message (won't show for mock, but keep structure) */}
      {/* {errorMessage && ( <p id={`${fieldName}-error`} ... >{errorMessage}</p> )} */}
    </div>
  );
};

export default MockFileUpload;