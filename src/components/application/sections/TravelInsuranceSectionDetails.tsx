// components/application/sections/TravelInsuranceSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils'; // Assuming date util

// Define specific props - Replace 'any' with a defined TravelInsuranceData type if you have one
interface TravelInsuranceSectionDetailsProps {
  data: any; // Ideally: TravelInsuranceData type
}

export default function TravelInsuranceSectionDetails({ data }: TravelInsuranceSectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Travel Insurance data provided.</div>;
  }

  const formatCurrency = (value: { amount?: number; currency?: string } | null | undefined): string => {
    if (!value?.amount || !value?.currency) return 'N/A';
    try {
        return value.amount.toLocaleString('en-GB', { style: 'currency', currency: value.currency, minimumFractionDigits: 0 });
        // Adjust locale (e.g., 'en-US') and options as needed
    } catch (e) {
        console.error("Error formatting currency:", value, e);
        return `${value.amount} ${value.currency}`; // Fallback
    }
  }

  return (
    <div className="space-y-5">
      {/* Insurance Policy Details */}
      {/* Render only if providerName or policyNumber exists */}
      {(data.providerName || data.policyNumber) && (
        <div>
          <h4 className="text-sm font-medium mb-2">Policy Details</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {data.providerName && <div><p className="text-xs text-gray-500">Insurance Provider</p><p className="text-sm font-medium">{data.providerName}</p></div>}
              {data.policyNumber && <div><p className="text-xs text-gray-500">Policy Number</p><p className="text-sm font-mono">{data.policyNumber}</p></div>}
              {data.coverageAmount && <div><p className="text-xs text-gray-500">Coverage Amount</p><p className="text-sm font-medium">{formatCurrency(data.coverageAmount)}</p></div>}
              {/* Coverage Period */}
              {(data.startDate || data.endDate) && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500">Coverage Period</p>
                  <p className="text-sm font-medium" suppressHydrationWarning>
                    {formatDate(data.startDate)} to {formatDate(data.endDate)}
                    {data.durationDays && <span className="text-xs text-gray-500 ml-2">({data.durationDays} days)</span>}
                  </p>
                </div>
              )}
              {/* Key Coverages */}
              {data.keyCoverages && data.keyCoverages.length > 0 && (
                <div className="sm:col-span-2">
                   <p className="text-xs text-gray-500 mb-1">Key Coverages</p>
                   <div className="flex flex-wrap gap-1.5">
                      {data.keyCoverages.map((coverage: string, index: number) => (
                         <Badge key={index} variant="outline" className="capitalize font-normal text-xs bg-blue-50 border-blue-200 text-blue-700">
                            {coverage.replace(/_/g, ' ')}
                         </Badge>
                      ))}
                   </div>
                </div>
               )}
               {/* Optional Notes */}
               {data.notes && (
                   <div className="sm:col-span-2 mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">{data.notes}</p>
                   </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Insurance Document */}
      {data.insuranceDocument && (
        <div>
          <h4 className="text-sm font-medium mb-2">Insurance Document</h4>
          <div className="p-3 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            {/* Doc Info */}
            <div className="flex-grow">
              <p className="text-sm font-medium capitalize">{data.insuranceDocument.type?.replace(/_/g, ' ') || 'Insurance Policy'}</p>
              {data.insuranceDocument.fileName && <p className="text-xs text-gray-500 font-mono">{data.insuranceDocument.fileName}</p>}
              {data.insuranceDocument.uploadedAt && <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>Uploaded: {formatDate(data.insuranceDocument.uploadedAt)}</p>}
              {data.insuranceDocument.verifiedAt && <p className="text-xs text-gray-500" suppressHydrationWarning>Verified: {formatDate(data.insuranceDocument.verifiedAt)}</p>}
            </div>
             {/* Status & Action */}
            <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
              {data.insuranceDocument.verificationStatus && (
                <Badge variant="outline" className={`text-xs ${
                    data.insuranceDocument.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
                    data.insuranceDocument.verificationStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-amber-100 text-amber-800 border-amber-200' // Default to pending/amber
                  }`}>
                  {data.insuranceDocument.verificationStatus.charAt(0).toUpperCase() + data.insuranceDocument.verificationStatus.slice(1)}
                </Badge>
              )}
              {data.insuranceDocument.fileUrl && (
                <Button variant="outline" size="sm" className="h-8" asChild>
                   <a href={data.insuranceDocument.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                   </a>
                </Button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}