// components/application/sections/DocumentsSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Check, X, AlertCircle, UploadCloud, HelpCircle } from 'lucide-react'; // Import necessary icons
import { formatDate } from '@/utils/dateUtils'; // Assuming date util
import { cn } from '@/lib/utils'; // For conditional classes

// Define specific props - Replace 'any' with a defined DocumentsData type if you have one
interface DocumentsSectionDetailsProps {
  data: any; // Ideally: DocumentsData type with requiredDocumentsList array
}

// Helper component for rendering individual document status item
const DocumentItem: React.FC<{ doc: any }> = ({ doc }) => {
    // Determine status color and icon
    const getStatusProps = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'verified':
            case 'uploaded': // Treat uploaded as provisionally okay until verified
                return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: Check };
            case 'pending':
            case 'pending_verification':
                return { color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: AlertCircle };
            case 'rejected':
            case 'missing':
                return { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: X };
            case 'required':
                return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: UploadCloud };
            case 'not_required':
                 return { color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: HelpCircle };
            default:
                return { color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: HelpCircle };
        }
    };

    const statusProps = getStatusProps(doc.status);
    const StatusIcon = statusProps.icon;

    const verificationStatus = doc.uploadedDocument?.verificationStatus;
    const verificationDate = doc.uploadedDocument?.verifiedAt;

    return (
        <div className={cn("p-3 bg-white rounded-md border", statusProps.borderColor)}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                {/* Left Side: Name, Status Icon, Notes */}
                <div className="flex items-start gap-3 flex-grow">
                    <StatusIcon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", statusProps.color)} />
                    <div className="flex-grow">
                        <p className="text-sm font-medium">{doc.docTypeName || doc.docType?.replace(/_/g, ' ') || 'Unknown Document'}</p>
                        <p className={cn("text-xs font-medium capitalize", statusProps.color)}>
                            Status: {doc.status?.replace(/_/g, ' ') || 'N/A'}
                        </p>
                        {doc.notes && <p className="text-xs text-gray-500 mt-1 italic">{doc.notes}</p>}
                    </div>
                </div>

                {/* Right Side: Uploaded Doc Info & View Button */}
                <div className="w-full sm:w-auto flex flex-col items-end sm:items-center sm:flex-row gap-3 flex-shrink-0 pl-8 sm:pl-0">
                    {doc.uploadedDocument && (
                        <div className="text-xs text-gray-500 text-left sm:text-right">
                            {doc.uploadedDocument.fileName && <p className="font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={doc.uploadedDocument.fileName}>{doc.uploadedDocument.fileName}</p>}
                            {doc.uploadedDocument.uploadedAt && <p suppressHydrationWarning>Uploaded: {formatDate(doc.uploadedDocument.uploadedAt)}</p>}
                            {verificationStatus && (
                                <p className={`capitalize font-medium ${
                                    verificationStatus === 'verified' ? 'text-green-600' :
                                    verificationStatus === 'failed' ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                    Verification: {verificationStatus} {verificationDate ? ` (${formatDate(verificationDate)})` : ''}
                                </p>
                            )}
                        </div>
                    )}
                     {doc.uploadedDocument?.fileUrl && (
                        <Button variant="outline" size="sm" className="h-8" asChild>
                           <a href={doc.uploadedDocument.fileUrl} target="_blank" rel="noopener noreferrer">
                               <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                           </a>
                        </Button>
                     )}
                     {/* Show placeholder/message if required but not uploaded */}
                     {doc.status === 'required' && !doc.uploadedDocument && (
                         <Badge variant="destructive" className="text-xs">Awaiting Upload</Badge>
                     )}
                      {doc.status === 'not_required' && (
                         <Badge variant="secondary" className="text-xs font-normal">Not Required</Badge>
                     )}
                </div>
            </div>
        </div>
    );
};


export default function DocumentsSectionDetails({ data }: DocumentsSectionDetailsProps) {
  // Handle cases where data might be missing entirely or no list provided
  if (!data || !data.requiredDocumentsList || data.requiredDocumentsList.length === 0) {
    return <div className="p-4 text-center text-gray-500">No required documents information provided for this application type.</div>;
  }

  return (
    <div className="space-y-3">
       <h4 className="text-sm font-medium mb-1">Required Documents Status</h4>
       {data.requiredDocumentsList.map((doc: any, index: number) => (
          <DocumentItem key={doc.docType || index} doc={doc} />
       ))}
       {/* Optionally, add overall section completion timestamp if available */}
       {data.completedAt && (
           <p className="text-xs text-gray-500 text-right mt-4" suppressHydrationWarning>
              Section Last Updated: {new Date(data.completedAt).toLocaleString('en-GB')}
           </p>
        )}
    </div>
  );
}