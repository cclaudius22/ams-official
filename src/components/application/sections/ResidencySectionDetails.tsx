// components/application/sections/ResidencySectionDetails.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils'; // Assuming it's in utils now

// Define specific props - Replace 'any' with a defined ResidencyData type if you have one
interface ResidencySectionDetailsProps {
  data: any; // Ideally: ResidencyData type
}

// Helper to format duration object if it exists
const formatDuration = (duration: { years?: number; months?: number } | null | undefined): string => {
  if (!duration) return 'N/A';
  const yearStr = duration.years ? `${duration.years} year${duration.years > 1 ? 's' : ''}` : '';
  const monthStr = duration.months ? `${duration.months} month${duration.months > 1 ? 's' : ''}` : '';
  if (yearStr && monthStr) return `${yearStr}, ${monthStr}`;
  return yearStr || monthStr || 'N/A';
}

export default function ResidencySectionDetails({ data }: ResidencySectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Residency data provided.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Current Address */}
      <div>
        <h4 className="text-sm font-medium mb-2">Current Address</h4>
        <div className="p-3 bg-white rounded-md border border-gray-200">
          {data.residencyAddress ? (
            <div>
              {/* Address Lines */}
              {data.residencyAddress.line1 && <p className="text-sm">{data.residencyAddress.line1}</p>}
              {data.residencyAddress.line2 && <p className="text-sm">{data.residencyAddress.line2}</p>}
              <p className="text-sm">
                {data.residencyAddress.city || ''}{data.residencyAddress.city && data.residencyAddress.postalCode ? ', ' : ''}
                {data.residencyAddress.postalCode || ''}
              </p>
              {data.residencyAddress.stateProvince && <p className="text-sm">{data.residencyAddress.stateProvince}</p>}
              <p className="text-sm font-medium">{data.residencyAddress.country || 'N/A'}</p>

              {/* Details below address */}
              <div className="flex flex-wrap mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500 gap-x-4 gap-y-1">
                 {data.residencyAddress.countryCode && (
                    <div>
                      <span className="text-xs font-medium">Country Code: </span>
                      <span className="font-mono bg-gray-100 px-1 rounded text-xs">{data.residencyAddress.countryCode}</span>
                    </div>
                 )}
                 {data.residencyAddress.residenceDuration && (
                    <div>
                      <span className="text-xs font-medium">Duration at Address: </span>
                      <span>{formatDuration(data.residencyAddress.residenceDuration)}</span>
                    </div>
                 )}
                 {data.residencyAddress.residenceType && (
                     <div>
                       <span className="text-xs font-medium">Type: </span>
                       <span className="capitalize">{data.residencyAddress.residenceType.replace(/_/g, ' ')}</span>
                     </div>
                 )}
              </div>
            </div>
          ) : (
            <div className="p-2 text-center text-gray-500 text-sm">
              <p>No address information available</p>
            </div>
          )}
        </div>
      </div>

      {/* Supporting Documents */}
      <div>
        <h4 className="text-sm font-medium mb-2">Proof of Address Documents</h4>
        <div className="space-y-3">
          {data.documents?.length > 0 ? (
            data.documents.map((doc: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex justify-between items-start gap-4"> {/* Added gap */}
                  {/* Document Info */}
                  <div className="flex-grow">
                    <h5 className="font-medium text-sm capitalize">{doc.type?.replace(/_/g, ' ') || 'Document'}</h5>
                    {doc.issuer && <p className="text-xs text-gray-500">Issuer: {doc.issuer}</p>}
                    {doc.issueDate && <p className="text-xs text-gray-500" suppressHydrationWarning>Issued: {formatDate(doc.issueDate)}</p>}
                    {doc.addressLines && doc.addressLines.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600 border-l-2 border-gray-200 pl-2 italic">
                        {doc.addressLines.map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Action Button */}
                  {doc.fileUrl && ( // Only show button if there's a URL
                    <Button variant="outline" size="sm" className="h-8 flex-shrink-0" asChild>
                       <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                       </a>
                    </Button>
                   )}
                </div>
                {/* File Metadata */}
                <div className="mt-2 text-xs text-gray-500 flex flex-wrap justify-between gap-2 border-t pt-2">
                   {doc.fileName && <span>Filename: <span className="font-mono">{doc.fileName}</span></span>}
                   {doc.uploadedAt && <span suppressHydrationWarning>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}</span>}
                   {doc.verificationStatus && (
                       <span className={`font-medium capitalize ${
                           doc.verificationStatus === 'verified' ? 'text-green-600' :
                           doc.verificationStatus === 'failed' ? 'text-red-600' : 'text-amber-600'
                       }`}>
                         Status: {doc.verificationStatus}
                       </span>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm bg-gray-50 rounded-md border">
              <p>No supporting documents provided</p>
            </div>
          )}
        </div>
      </div>

      {/* Verification Information */}
      {(data.verificationTimestamp || data.verificationCompletedTimestamp || data.residencyAddress?.verificationMethod) && (
          <div>
            <h4 className="text-sm font-medium mb-2">Address Verification Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {data.residencyAddress?.verificationMethod && (
                 <div className="p-2 bg-white rounded-md border border-gray-200 md:col-span-1">
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm capitalize">{data.residencyAddress.verificationMethod.replace(/_/g, ' ')}</p>
                 </div>
               )}
               {data.verificationTimestamp && (
                 <div className="p-2 bg-white rounded-md border border-gray-200">
                    <p className="text-xs text-gray-500">Started</p>
                    <p className="text-sm" suppressHydrationWarning>{new Date(data.verificationTimestamp).toLocaleString('en-GB')}</p>
                 </div>
               )}
               {data.verificationCompletedTimestamp && (
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-sm" suppressHydrationWarning>{new Date(data.verificationCompletedTimestamp).toLocaleString('en-GB')}</p>
                  </div>
               )}
            </div>
             {data.verificationNotes && (
                 <div className="mt-2 text-xs p-2 bg-blue-50 rounded border border-blue-100">
                    <p className="font-medium text-blue-800 mb-1">Verification Notes:</p>
                    {data.verificationNotes}
                 </div>
             )}
          </div>
       )}
    </div>
  );
}