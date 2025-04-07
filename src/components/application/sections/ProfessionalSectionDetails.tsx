// components/application/sections/ProfessionalSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils'; 

// Define specific props - Replace 'any' with a defined ProfessionalData type if you have one
interface ProfessionalSectionDetailsProps {
  data: any; // Ideally: ProfessionalData type
}

// Helper function to calculate duration between two dates (can be moved to utils)
const calculateDuration = (startDate: string | undefined | null, endDate: string | undefined | null): string => {
    if (!startDate || !endDate) return '';
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '';

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        const yearString = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
        const monthString = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

        if (yearString && monthString) return `${yearString}, ${monthString}`;
        if (yearString) return yearString;
        if (monthString) return monthString;
        return 'Less than a month';

    } catch (e) {
        console.error("Error calculating duration:", startDate, endDate, e);
        return '';
    }
}

export default function ProfessionalSectionDetails({ data }: ProfessionalSectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Professional data provided.</div>;
  }

  const formatSalary = (salary: { amount?: number; currency?: string } | null | undefined): string => {
    if (!salary?.amount || !salary?.currency) return 'N/A';
    try {
      return `${salary.amount.toLocaleString('en-US', { style: 'currency', currency: salary.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
       // Adjust locale and options as needed
    } catch (e) {
       console.error("Error formatting currency:", salary, e);
       return `${salary.amount} ${salary.currency}`; // Fallback
    }
  }

  return (
    <div className="space-y-5">
      {/* Current Employment Information */}
      {data.companyName && ( // Only show if company name exists
          <div>
            <h4 className="text-sm font-medium mb-2">Current Employment</h4>
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <div className="flex flex-col space-y-4">
                {/* Top row: Company/Role and Salary */}
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <h5 className="font-semibold text-base">{data.companyName}</h5>
                    <p className="text-sm text-gray-700">{data.jobRole || 'N/A'}</p>
                    <p className="text-xs text-gray-500" suppressHydrationWarning>
                      {data.startDate ? `Since ${formatDate(data.startDate)}` : ''} {data.yearsInRole ? ` (~${data.yearsInRole} years)` : ''}
                    </p>
                  </div>
                  {data.annualSalary && (
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-green-700">
                         {formatSalary(data.annualSalary)}
                      </p>
                      <p className="text-xs text-gray-500">Annual Salary</p>
                    </div>
                   )}
                </div>

                {/* Grid for other details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm pt-3 border-t border-gray-100">
                   {data.employmentType && <div><p className="text-xs text-gray-500">Type</p><p className="capitalize">{data.employmentType.replace(/_/g, ' ')}</p></div>}
                   {data.industry && <div><p className="text-xs text-gray-500">Industry</p><p>{data.industry}</p></div>}
                   {data.department && <div><p className="text-xs text-gray-500">Department</p><p>{data.department}</p></div>}
                   {data.jobLevel && <div><p className="text-xs text-gray-500">Level</p><p className="capitalize">{data.jobLevel}</p></div>}
                </div>

                {/* Responsibilities List */}
                {data.responsibilities && data.responsibilities.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Key Responsibilities</p>
                    <ul className="list-disc pl-5 text-sm space-y-0.5 text-gray-700">
                      {data.responsibilities.map((resp: string, index: number) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills Badges */}
                {data.skills && data.skills.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="font-normal"> {/* Using secondary variant */}
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
       )}

      {/* Employer Information */}
      {(data.employerAddress || data.employerContact) && ( // Only show if address OR contact exists
          <div>
            <h4 className="text-sm font-medium mb-2">Employer Information</h4>
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employer Address */}
                {data.employerAddress && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Address</p>
                    <div className="text-sm text-gray-700">
                      {data.employerAddress.line1 && <p>{data.employerAddress.line1}</p>}
                      {data.employerAddress.line2 && <p>{data.employerAddress.line2}</p>}
                      <p>
                         {data.employerAddress.city || ''}{data.employerAddress.city && data.employerAddress.postalCode ? ', ' : ''}
                         {data.employerAddress.postalCode || ''}
                      </p>
                      {data.employerAddress.stateProvince && <p>{data.employerAddress.stateProvince}</p>}
                      <p>{data.employerAddress.country || 'N/A'}</p>
                    </div>
                  </div>
                 )}

                {/* Employer Contact */}
                {data.employerContact && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Contact Person</p>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <p className="font-semibold">{data.employerContact.name || 'N/A'}</p>
                      {data.employerContact.position && <p>{data.employerContact.position}</p>}
                      {data.employerContact.email && <p className="text-xs text-blue-600">{data.employerContact.email}</p>}
                      {data.employerContact.phone && <p className="text-xs">{data.employerContact.phone}</p>}
                    </div>
                  </div>
                 )}
              </div>
            </div>
          </div>
       )}

      {/* Employment Documents */}
      <div>
        <h4 className="text-sm font-medium mb-2">Supporting Documents</h4>
        <div className="space-y-2"> {/* Changed grid to space-y */}
          {data.employmentDocuments?.length > 0 ? (
            data.employmentDocuments.map((doc: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                {/* Doc Info */}
                <div className="flex-grow">
                  <p className="text-sm font-medium capitalize">{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
                  {doc.fileName && <p className="text-xs text-gray-500 font-mono">{doc.fileName}</p>}
                   {doc.description && <p className="text-xs text-gray-600 mt-1">{doc.description}</p>}
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
              <p>No employment documents provided</p>
            </div>
          )}
        </div>
      </div>

      {/* Previous Employment */}
      {data.previousEmployment && data.previousEmployment.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Previous Employment</h4>
          <div className="space-y-2">
            {data.previousEmployment.map((job: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between gap-1">
                  <div>
                    <p className="text-sm font-medium">{job.companyName || 'N/A'}</p>
                    <p className="text-sm text-gray-700">{job.jobRole || 'N/A'}</p>
                  </div>
                  <div className="text-left sm:text-right text-sm text-gray-600 flex-shrink-0">
                    <p suppressHydrationWarning>
                      {job.startDate ? formatDate(job.startDate) : '?'} - {job.endDate ? formatDate(job.endDate) : 'Present'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {calculateDuration(job.startDate, job.endDate || new Date().toISOString())} {/* Calculate duration to present if no end date */}
                    </p>
                  </div>
                </div>
                {job.reasonForLeaving && (
                  <div className="mt-1.5 text-xs text-gray-600 pt-1.5 border-t border-gray-100">
                    <span className="text-gray-500 font-medium">Reason for leaving: </span>
                    {job.reasonForLeaving}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qualifications */}
      {data.qualifications && data.qualifications.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Qualifications</h4>
          <div className="space-y-2">
            {data.qualifications.map((qual: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium">{qual.name || 'N/A'}</p>
                        <p className="text-sm text-gray-700">{qual.institution || 'N/A'}</p>
                        {qual.specialization && <p className="text-xs text-gray-600">{qual.specialization}</p>}
                    </div>
                    {qual.yearCompleted && <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{qual.yearCompleted}</p>}
                </div>
                 {/* Optional: Add document link if available */}
                 {qual.certificateUrl && (
                     <div className="mt-2 pt-2 border-t border-gray-100 text-right">
                        <Button variant="link" size="sm" className="h-7 text-xs" asChild>
                           <a href={qual.certificateUrl} target="_blank" rel="noopener noreferrer">View Certificate</a>
                        </Button>
                     </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Information */}
      {data.verificationChecks && (
        <div>
          <h4 className="text-sm font-medium mb-2">Verification Information</h4>
          <div className="p-3 bg-white rounded-md border border-gray-200">
            {/* Verification Status Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(data.verificationChecks)
                  // Filter out non-boolean verification flags (like method, date, notes)
                  .filter(([key, value]) => typeof value === 'boolean' && key !== 'overallResult') // Adjust filter as needed
                  .map(([key, value]) => (
                      <Badge key={key} variant={value ? "success" : "destructive"} className="capitalize gap-1.5">
                           {value ? <CheckCircle2 className="h-3 w-3"/> : <XCircle className="h-3 w-3"/>}
                           {key.replace(/Verified$/, '').replace(/([A-Z])/g, ' $1').trim()} {/* Format key */}
                      </Badge>
                ))}
            </div>
             {/* Other Verification Details */}
            <div className="text-xs text-gray-500 space-y-0.5 border-t pt-2">
               {data.verificationChecks.verificationMethod && <p>Method: <span className="capitalize font-medium text-gray-700">{data.verificationChecks.verificationMethod.replace(/_/g, ' ')}</span></p>}
               {data.verificationChecks.verificationDate && <p suppressHydrationWarning>Verified On: <span className="font-medium text-gray-700">{new Date(data.verificationChecks.verificationDate).toLocaleString('en-GB')}</span></p>}
               {data.verificationChecks.verifiedBy && <p>Verified By: <span className="font-medium text-gray-700">{data.verificationChecks.verifiedBy}</span></p>}
            </div>
             {/* Verification Notes */}
            {data.verificationChecks.verificationNotes && (
              <div className="mt-2 text-xs p-2 bg-blue-50 rounded border border-blue-100">
                 <p className="font-medium text-blue-800 mb-1">Verification Notes:</p>
                 <p className="text-blue-700">{data.verificationChecks.verificationNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// Added imports needed for the enhanced verification display
import { CheckCircle2, XCircle } from 'lucide-react';

// Extend Badge variants in your ui/badge.tsx if needed for success/destructive:
/*
const badgeVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // ... other variants
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80",
        destructive: "border-transparent bg-red-100 text-destructive hover:bg-red-100/80",
      }
    }
    // ...
  }
)
*/