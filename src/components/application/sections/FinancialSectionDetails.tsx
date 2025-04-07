// components/application/sections/FinancialSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle } from 'lucide-react'; // Added Check/X icons
import { formatDate } from '@/utils/dateUtils'; // Assuming date util

// Define specific props - Replace 'any' with a defined FinancialData type if you have one
interface FinancialSectionDetailsProps {
  data: any; // Ideally: FinancialData type
}

export default function FinancialSectionDetails({ data }: FinancialSectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Financial data provided.</div>;
  }

  // Helper to mask account number but show last 4 digits
  const formatAccountNumber = (accNum: string | null | undefined): string => {
    if (!accNum) return 'N/A';
    if (accNum.length <= 4) return accNum; // Return as-is if too short
    return `**** ${accNum.slice(-4)}`;
  }

  return (
    <div className="space-y-5">
      {/* Account Details */}
      {/* Only render if at least bankName or accountHolderName exists */}
      {(data.bankName || data.accountHolderName) && (
        <div>
          <h4 className="text-sm font-medium mb-2">Bank Account Details</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
               {data.bankName && <div><p className="text-xs text-gray-500">Bank Name</p><p className="text-sm font-medium">{data.bankName}</p></div>}
               {data.accountHolderName && <div><p className="text-xs text-gray-500">Account Holder</p><p className="text-sm font-medium">{data.accountHolderName}</p></div>}
               {data.accountNumber && <div><p className="text-xs text-gray-500">Account Number</p><p className="text-sm font-mono">{formatAccountNumber(data.accountNumber)}</p></div>}
               {data.sortCode && <div><p className="text-xs text-gray-500">Sort Code / Routing</p><p className="text-sm font-mono">{data.sortCode}</p></div>}
               {data.iban && <div><p className="text-xs text-gray-500">IBAN</p><p className="text-sm font-mono">{data.iban}</p></div>}
               {data.swiftBic && <div><p className="text-xs text-gray-500">SWIFT/BIC</p><p className="text-sm font-mono">{data.swiftBic}</p></div>}
               {data.accountType && <div><p className="text-xs text-gray-500">Account Type</p><p className="text-sm capitalize">{data.accountType.replace(/_/g, ' ')}</p></div>}
               {data.currency && <div><p className="text-xs text-gray-500">Currency</p><p className="text-sm font-medium">{data.currency}</p></div>}
            </div>
          </div>
        </div>
       )}

      {/* Supporting Documents */}
      <div>
        <h4 className="text-sm font-medium mb-2">Financial Documents</h4>
        <div className="space-y-2">
          {data.documents?.length > 0 ? (
            data.documents.map((doc: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                {/* Doc Info */}
                <div className="flex-grow">
                  <p className="text-sm font-medium capitalize">{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
                  {doc.fileName && <p className="text-xs text-gray-500 font-mono">{doc.fileName}</p>}
                  {doc.description && <p className="text-xs text-gray-600 mt-1">{doc.description}</p>}
                  <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                     {doc.uploadedBy ? `Uploaded by ${doc.uploadedBy}` : ''}
                     {doc.uploadedBy && doc.uploadedAt ? ' on ' : ''}
                     {doc.uploadedAt ? formatDate(doc.uploadedAt) : ''}
                  </p>
                  {/* Display statement period if available */}
                  {doc.statementStartDate && doc.statementEndDate && (
                    <p className="text-xs text-gray-500" suppressHydrationWarning>
                      Period: {formatDate(doc.statementStartDate)} - {formatDate(doc.statementEndDate)}
                    </p>
                  )}
                </div>
                {/* Status & Action */}
                <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                  {doc.verificationStatus && (
                    <Badge variant="outline" className={`text-xs ${
                        doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
                        doc.verificationStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-amber-100 text-amber-800 border-amber-200' // Default to pending/amber
                      }`}>
                      {doc.verificationStatus.charAt(0).toUpperCase() + doc.verificationStatus.slice(1)}
                    </Badge>
                  )}
                  {doc.fileUrl && (
                    <Button variant="outline" size="sm" className="h-8" asChild>
                       <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                       </a>
                    </Button>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm bg-gray-50 rounded-md border">
              <p>No financial documents provided</p>
            </div>
          )}
        </div>
      </div>

      {/* Verification Information */}
      {data.verificationChecks && (
        <div>
          <h4 className="text-sm font-medium mb-2">Verification Information</h4>
          <div className="p-3 bg-white rounded-md border border-gray-200">
            {/* Verification Status Pills/Checks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
               {typeof data.verificationChecks.fundsVerified === 'boolean' && (
                 <div className="flex items-center text-sm">
                   {data.verificationChecks.fundsVerified
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0"/>
                      : <XCircle className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0"/>
                    }
                    <span>Sufficient Funds Verified</span>
                 </div>
               )}
               {typeof data.verificationChecks.sourceOfFundsVerified === 'boolean' && (
                 <div className="flex items-center text-sm">
                    {data.verificationChecks.sourceOfFundsVerified
                       ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0"/>
                       : <XCircle className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0"/>
                     }
                    <span>Source of Funds Verified</span>
                 </div>
               )}
               {typeof data.verificationChecks.incomeVerified === 'boolean' && (
                 <div className="flex items-center text-sm">
                    {data.verificationChecks.incomeVerified
                       ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0"/>
                       : <XCircle className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0"/>
                     }
                    <span>Regular Income Verified</span>
                 </div>
               )}
               {/* Add other boolean checks similarly */}
            </div>

             {/* Other Verification Details */}
            <div className="text-xs text-gray-500 space-y-0.5 border-t pt-2">
               {data.verificationChecks.verificationMethod && <p>Method: <span className="capitalize font-medium text-gray-700">{data.verificationChecks.verificationMethod.replace(/_/g, ' ')}</span></p>}
               {data.verificationChecks.verificationDate && <p suppressHydrationWarning>Verified On: <span className="font-medium text-gray-700">{new Date(data.verificationChecks.verificationDate).toLocaleString('en-GB')}</span></p>}
               {data.verificationChecks.verifiedBy && <p>Verified By: <span className="font-medium text-gray-700">{data.verificationChecks.verifiedBy}</span></p>}
               {/* Display available funds if present */}
               {data.verificationChecks.availableFunds && (
                   <p>Verified Available Funds: <span className="font-medium text-gray-700">{data.verificationChecks.availableFunds.amount?.toLocaleString()} {data.verificationChecks.availableFunds.currency}</span></p>
               )}
            </div>

             {/* Verification Notes */}
            {data.verificationChecks.verificationNotes && (
              <div className="mt-2 text-xs p-2 bg-blue-50 rounded border border-blue-100">
                 <p className="font-medium text-blue-800 mb-1">Verification Notes:</p>
                 <p className="text-blue-700 whitespace-pre-wrap">{data.verificationChecks.verificationNotes}</p> {/* Added whitespace-pre-wrap */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}