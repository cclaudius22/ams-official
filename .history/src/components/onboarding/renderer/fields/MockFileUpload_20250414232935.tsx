// src/components/onboarding/renderer/fields/MockFileUpload.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileCheck, CircleAlert } from "lucide-react";
import { FieldConfig } from '@/components/onboarding/configurator/types';

interface MockFileUploadProps {
  fieldConfig: FieldConfig & { config?: { allowedDocumentTypes?: string[] } };
}

const MockFileUpload = ({ fieldConfig }: MockFileUploadProps) => {
  const { fieldName, label, isRequired, config } = fieldConfig;
  const allowedTypes = config?.allowedDocumentTypes || [];
  const { setValue, getValues, watch } = useFormContext(); // Use watch if needed
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [mockFileName, setMockFileName] = useState<string>('');
  const needsTypeSelection = allowedTypes.length > 0;

  // Optional: Sync local state if RHF has initial data
  const currentFieldValue = watch(fieldName);
  useEffect(() => {
    if (currentFieldValue?.status === 'mock_uploaded') {
      setUploadStatus('success');
      setMockFileName(currentFieldValue.fileName);
      setSelectedDocType(currentFieldValue.documentType);
    } else if (uploadStatus !== 'idle' && !currentFieldValue) {
       // Reset local state if RHF value was cleared externally
       setUploadStatus('idle');
       setMockFileName('');
       setSelectedDocType('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFieldValue]); // Only run when RHF value changes

  const handleMockUpload = () => { /* ... (same as before) ... */
      if (needsTypeSelection && !selectedDocType) { alert(...); return; }
      setUploadStatus('uploading');
      const fileName = `mock_${selectedDocType || 'document'}_${Date.now()}.pdf`;
      setMockFileName(fileName);
      setTimeout(() => { /* ... (setValue logic) ... */
          setUploadStatus('success');
          setValue( fieldName, { status: 'mock_uploaded', fileName: fileName, documentType: selectedDocType || 'generic', uploadedAt: new Date().toISOString() }, { shouldValidate: true, shouldDirty: true } );
       }, 1500);
   };
  const handleReset = () => { /* ... (same as before) ... */
      setUploadStatus('idle'); setMockFileName(''); setSelectedDocType(needsTypeSelection ? '' : selectedDocType);
      setValue(fieldName, null, { shouldValidate: true, shouldDirty: true });
   };

  return (
    <div className="space-y-2">
       <Label htmlFor={fieldName + '-trigger'}>{label || fieldName}{isRequired && '*'}</Label>
       <Card className="p-4">
          <CardContent className="p-0 space-y-4">
            {needsTypeSelection && uploadStatus !== 'success' && (
               <div className='space-y-1'>
                  <Label htmlFor={fieldName + '-doc-type'} className="text-xs font-medium">Document Type</Label>
                  <Select
                     value={selectedDocType}
                     onValueChange={setSelectedDocType}
                     required={isRequired}
                  >
                     <SelectTrigger id={fieldName + '-doc-type'}>
                       {/* Use the placeholder prop here */}
                       <SelectValue placeholder="Select document type..." />
                     </SelectTrigger>
                     <SelectContent>
                       {/* --- REMOVED INVALID SelectItem --- */}
                       {/* <SelectItem value="" disabled>Select document type...</SelectItem> */}
                       {allowedTypes.map(docType => (
                         <SelectItem key={docType} value={docType}>
                           {docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
               </div>
            )}
            {/* ... rest of the component (upload area, status display) ... */}
            {uploadStatus === 'idle' && ( <div className="border-2 border-dashed ..."> {/* ... */} <Button onClick={handleMockUpload} disabled={needsTypeSelection && !selectedDocType}>Simulate Upload</Button> </div> )}
            {uploadStatus === 'uploading' && ( <div className="border border-blue-200 ...">Uploading...</div> )}
            {uploadStatus === 'success' && ( <div className="border border-green-200 ..."> <p>File: {mockFileName}</p> <Button onClick={handleReset}>Remove</Button> </div> )}
            {uploadStatus === 'error' && ( <div className="border border-destructive/30 ...">Failed <Button onClick={handleReset}>Try Again</Button></div> )}
          </CardContent>
       </Card>
        {/* ... help text ... */}
    </div>
  );
};

export default MockFileUpload;