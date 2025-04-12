// src/components/visa-builder/DocumentConfigurator.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Stage, DocumentType } from './interfaces'; // Import interfaces

interface DocumentConfiguratorProps {
  documentTypes: DocumentType[];
  selectedCategory: string;
  conditionalStages: Stage[]; // Needed to check if the dynamic stage is enabled
  toggleDocumentEnabled: (docId: string) => void;
  addDocumentType: () => void;
  removeDocumentType: (docId: string) => void;
  openDocumentModal: (docId: string) => void;
}

const DocumentConfigurator: React.FC<DocumentConfiguratorProps> = ({
  documentTypes,
  selectedCategory,
  conditionalStages,
  toggleDocumentEnabled,
  addDocumentType,
  removeDocumentType,
  openDocumentModal,
}) => {

  // Check if the dynamic document upload stage is enabled for the *current* configuration
  const isDynamicUploadEnabled = conditionalStages.find(
    s => s.id === 'DYNAMIC_DOCUMENTS_UPLOAD' && s.enabled
  );

  // Filter documents based on the selected category for display
  const filteredDocuments = documentTypes.filter(doc =>
    !doc.categories || doc.categories.length === 0 || doc.categories.includes(selectedCategory)
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>3. Document Requirements</CardTitle>
        <p className="text-sm text-gray-500">
          Specify documents needed for the "Additional Documents" stage (if enabled).
        </p>
      </CardHeader>
      <CardContent>
        {!isDynamicUploadEnabled ? (
          // Show message if the dynamic stage is disabled
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-yellow-700">
             <div className="flex items-center">
               <AlertCircle className="h-5 w-5 mr-3"/>
               <div>
                 <p className="font-medium text-sm">"Additional Documents" Stage Disabled</p>
                 <p className="text-xs">Enable the stage in Step 2 to configure document requirements here.</p>
               </div>
             </div>
          </div>
        ) : (
          // Show document list and add button if the stage is enabled
          <>
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={addDocumentType}>
                <Plus className="h-4 w-4 mr-1" />
                Add Document Type
              </Button>
            </div>
            <div className="space-y-2">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border rounded-md p-3 transition-colors duration-150 ${doc.enabled ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      {/* Document Info */}
                      <div className="flex items-start flex-grow min-w-0"> {/* Added min-w-0 for flex basis */}
                          <FileText className={`h-5 w-5 mr-2 flex-shrink-0 mt-1 ${doc.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="min-w-0"> {/* Added min-w-0 */}
                            <p className={`font-medium text-sm truncate ${doc.enabled ? 'text-gray-900' : 'text-gray-500'}`}>{doc.name}</p>
                            <p className={`text-xs mt-1 line-clamp-1 ${doc.enabled ? 'text-gray-500' : 'text-gray-400'}`}>{doc.description}</p>
                            <div className="flex mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded mr-2 ${doc.enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                                  {doc.format || 'N/A'}
                                </span>
                                {doc.examples && doc.examples.length > 0 && (
                                <span className={`text-xs ${doc.enabled ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {doc.examples.length} validation rule(s)
                                </span>
                                )}
                           </div>
                          </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                        <Button
                          variant={doc.enabled ? "default" : "outline"}
                          size="sm"
                          className="text-xs px-2 h-8"
                          onClick={() => toggleDocumentEnabled(doc.id)}
                        >
                          {doc.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                           className="text-xs px-2 h-8"
                          onClick={() => openDocumentModal(doc.id)}
                        >
                          Edit
                        </Button>
                        {/* Consider adding a confirmation before removing */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeDocumentType(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Remove Document Type</span>
                        </Button>
                      </div>
                    </div>


                  </div>
                ))
              ) : (
                  <p className="text-sm text-gray-400 italic text-center py-4">No relevant document types found for this category. Click "Add Document Type" to create one.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentConfigurator;