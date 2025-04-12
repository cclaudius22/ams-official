// src/components/visa-builder/DocumentModal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2 } from 'lucide-react';
import { DocumentType } from './interfaces';

interface DocumentModalProps {
  docId: string;
  documentTypes: DocumentType[];
  updateDocumentField: (docId: string, field: keyof DocumentType, value: string | boolean | string[]) => void;
  updateDocumentExample: (docId: string, index: number, value: string) => void;
  addDocumentExample: (docId: string) => void;
  removeDocumentExample: (docId: string, index: number) => void;
  closeModal: () => void;
  toggleDocumentEnabled: (docId: string) => void;
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
    // This should ideally not happen if the modal is opened correctly
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 shadow-xl">
                <p className="text-red-600 font-semibold">Error: Document not found!</p>
                <Button onClick={closeModal} className="mt-4">Close</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b flex justify-between items-center">
           <h3 className="text-lg font-semibold text-gray-800">Configure: {doc.name || 'New Document'}</h3>
           <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8">
             <X className="h-5 w-5 text-gray-500" />
             <span className="sr-only">Close</span>
           </Button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-grow">
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
                placeholder="Guidance shown to the applicant..."
              />
            </div>

            <div>
              <Label htmlFor="docPurpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose</Label>
              <Textarea
                id="docPurpose"
                value={doc.purpose}
                onChange={(e) => updateDocumentField(doc.id, 'purpose', e.target.value)}
                className="w-full h-20"
                 placeholder="Internal note on why this document is needed..."
              />
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
              <p className="text-xs text-gray-500 mb-2">Examples or specific validation points for AI (e.g., "Must show address", "Date must be recent").</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2"> {/* Added max-height and scroll */}
                {doc.examples?.map((example, index) => ( // Added optional chaining ?.
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
                      aria-label="Remove Rule"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {(!doc.examples || doc.examples.length === 0) && ( // Check for undefined or empty
                   <p className="text-xs text-gray-400 italic text-center">No specific rules/examples defined.</p>
                )}
              </div>
            </div>
             {/* Placeholder for category multi-select if needed later */}
             {/* <div> ... Categories ... </div> */}
        </div>

         {/* Footer Actions */}
         <div className="flex-shrink-0 bg-gray-50 px-6 py-3 border-t flex justify-between items-center">
             <Button
                 variant={doc.enabled ? "destructive" : "secondary"} // Made disable more prominent
                 onClick={() => toggleDocumentEnabled(doc.id)}
                 size="sm"
                 className="text-xs"
             >
                 {doc.enabled ? 'Disable Requirement' : 'Enable Requirement'}
             </Button>
             <Button onClick={closeModal} size="sm">
                 Done Editing
             </Button>
         </div>
      </div>
    </div>
  );
};

export default DocumentModal;