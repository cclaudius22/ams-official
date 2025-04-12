// src/components/visa-builder/DocumentModal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2 } from 'lucide-react';
import { DocumentType } from './interfaces'; // Import interface

interface DocumentModalProps {
  docId: string;
  documentTypes: DocumentType[]; // Need the full list to find the doc
  updateDocumentField: (docId: string, field: keyof DocumentType, value: string | boolean | string[]) => void;
  updateDocumentExample: (docId: string, index: number, value: string) => void;
  addDocumentExample: (docId: string) => void;
  removeDocumentExample: (docId: string, index: number) => void;
  closeModal: () => void;
  toggleDocumentEnabled: (docId: string) => void; // Allow toggling from modal
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  docId,
  documentTypes,
  updateDocumentField,
  updateDocumentExample,
  addDocumentExample,
  removeDocumentExample,
  closeModal,
  toggleDocumentEnabled,
}) => {

  const doc = documentTypes.find(d => d.id === docId);

  if (!doc) {
    console.error("Document not found in modal:", docId);
    return null; // Or some fallback UI
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b z-10 flex justify-between items-center">
           <h3 className="text-lg font-semibold text-gray-800">Document Configuration</h3>
           <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8">
             <X className="h-5 w-5 text-gray-500" />
             <span className="sr-only">Close</span>
           </Button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="docName" className="block text-sm font-medium text-gray-700 mb-1">Document Name</Label>
              <Input
                id="docName"
                type="text"
                value={doc.name}
                onChange={(e) => updateDocumentField(doc.id, 'name', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="docDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
              <Textarea
                id="docDescription"
                value={doc.description}
                onChange={(e) => updateDocumentField(doc.id, 'description', e.target.value)}
                className="w-full h-20"
              />
               <p className="text-xs text-gray-500 mt-1">Guidance shown to the applicant.</p>
            </div>

            <div>
              <Label htmlFor="docPurpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose</Label>
              <Textarea
                id="docPurpose"
                value={doc.purpose}
                onChange={(e) => updateDocumentField(doc.id, 'purpose', e.target.value)}
                className="w-full h-20"
              />
              <p className="text-xs text-gray-500 mt-1">Internal note on why this document is needed.</p>
            </div>

            <div>
              <Label htmlFor="docFormat" className="block text-sm font-medium text-gray-700 mb-1">Accepted Format(s)</Label>
              <Input
                id="docFormat"
                type="text"
                value={doc.format}
                onChange={(e) => updateDocumentField(doc.id, 'format', e.target.value)}
                className="w-full"
                placeholder="e.g., PDF, JPEG, PNG"
              />
               <p className="text-xs text-gray-500 mt-1">Inform applicant about allowed file types.</p>
            </div>

            {/* Validation Rules / Examples */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="block text-sm font-medium text-gray-700">Validation Rules / Examples</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addDocumentExample(doc.id)}
                  type="button"
                  className="text-xs"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Provide examples or specific validation points the AI should look for (e.g., "Must show address", "Date must be within last 3 months").</p>
              <div className="space-y-2">
                {doc.examples.map((example, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={example}
                      onChange={(e) => updateDocumentExample(doc.id, index, e.target.value)}
                      className="w-full text-sm"
                      placeholder={`Rule/Example ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocumentExample(doc.id, index)}
                      className="flex-shrink-0 h-8 w-8"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                       <span className="sr-only">Remove Rule</span>
                    </Button>
                  </div>
                ))}
                {doc.examples.length === 0 && (
                   <p className="text-xs text-gray-400 italic text-center">No specific rules/examples defined.</p>
                )}
              </div>
            </div>

            {/* Add Category Selection Here if needed */}
             {/* <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Applicable Visa Categories</Label>
              <p className="text-xs text-gray-500 mb-2">Select which visa types this document applies to (optional).</p>
              // Add multi-select component here to manage doc.categories array
             </div> */}

          </div>
        </div>

         {/* Footer Actions */}
         <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t flex justify-between items-center">
             <Button
                 variant={doc.enabled ? "destructiveOutline" : "secondary"} // Example: Use different variants
                 onClick={() => toggleDocumentEnabled(doc.id)}
                 size="sm"
                 className="text-xs"
             >
                 {doc.enabled ? 'Set as Disabled' : 'Set as Enabled'}
             </Button>
             <div className="space-x-2">
                 <Button variant="outline" onClick={closeModal} size="sm">
                     Cancel
                 </Button>
                 <Button onClick={closeModal} size="sm"> {/* Save happens implicitly via state updates */}
                     Done
                 </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DocumentModal;