// components/application/sections/ReligiousSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Building, Briefcase, GraduationCap, HandCoins, CheckSquare } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters'; // Import formatDate here

interface ReligiousSectionDetailsProps {
  data: any; // Ideally: ReligiousWorkerData type
}

export default function ReligiousSectionDetails({ data }: ReligiousSectionDetailsProps) {
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Religious Worker data provided.</div>;
  }

  const formatSalaryFreq = (salary: { amount?: number; currency?: string, frequency?: string } | null | undefined): string => {
      if (!salary?.amount || !salary?.currency || !salary.frequency) return 'N/A';
      return `${formatCurrency(salary)} (${salary.frequency})`;
  }

  return (
    <div className="space-y-5">
      {/* Sponsoring Organisation */}
      {data.sponsoringOrganisation && (
        <div>
          <h4 className="text-sm font-medium mb-2">Sponsoring Organisation</h4>
           <div className="p-4 bg-white rounded-md border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {data.sponsoringOrganisation.name && <div className="sm:col-span-2"><p className="text-xs text-gray-500">Name</p><p className="text-sm font-medium flex items-center gap-1"><Building className="h-4 w-4 text-gray-400"/> {data.sponsoringOrganisation.name}</p></div>}
              {data.sponsoringOrganisation.address && <div><p className="text-xs text-gray-500">Address</p><p className="text-sm">{data.sponsoringOrganisation.address}</p></div>}
              {data.sponsoringOrganisation.charityNumber && <div><p className="text-xs text-gray-500">Charity/Reg. No.</p><p className="text-sm font-mono">{data.sponsoringOrganisation.charityNumber}</p></div>}
              {data.sponsoringOrganisation.sponsorLicenseNumber && <div><p className="text-xs text-gray-500">Sponsor License No.</p><p className="text-sm font-mono">{data.sponsoringOrganisation.sponsorLicenseNumber}</p></div>}
           </div>
        </div>
      )}

      {/* Role Details */}
      {data.roleDetails && (
        <div>
          <h4 className="text-sm font-medium mb-2">Role Details</h4>
           <div className="p-4 bg-white rounded-md border border-gray-200 space-y-4">
               {/* Basic Role Info */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                   {data.roleDetails.jobTitle && <div><p className="text-xs text-gray-500">Job Title</p><p className="text-sm font-medium flex items-center gap-1"><Briefcase className="h-4 w-4 text-gray-400"/>{data.roleDetails.jobTitle}</p></div>}
                   {(data.roleDetails.startDate || data.roleDetails.durationMonths) && (
                       <div>
                           <p className="text-xs text-gray-500">Period</p>
                           <p className="text-sm" suppressHydrationWarning>
                               {formatDate(data.roleDetails.startDate)} {data.roleDetails.durationMonths ? `(for ${data.roleDetails.durationMonths} months)`: ''}
                           </p>
                       </div>
                   )}
                   {data.roleDetails.isVoluntary !== undefined && <div><p className="text-xs text-gray-500">Remuneration</p><p className="text-sm font-medium">{data.roleDetails.isVoluntary ? 'Voluntary' : `Paid: ${formatSalaryFreq(data.roleDetails.salaryOrStipend)}`}</p></div>}
                   {data.roleDetails.accommodationProvided !== undefined && (
                        <div className="sm:col-span-2">
                           <p className="text-xs text-gray-500">Accommodation</p>
                           <p className="text-sm font-medium">{data.roleDetails.accommodationProvided ? `Provided (${data.roleDetails.accommodationDetails || 'Details N/A'})` : 'Not Provided'}</p>
                        </div>
                    )}
               </div>
                {/* Main Duties List */}
               {data.roleDetails.mainDuties && data.roleDetails.mainDuties.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Main Duties</p>
                    <ul className="list-disc pl-5 text-sm space-y-0.5 text-gray-700">
                      {data.roleDetails.mainDuties.map((duty: string, index: number) => (
                        <li key={index}>{duty}</li>
                      ))}
                    </ul>
                  </div>
                )}
           </div>
        </div>
      )}

       {/* Applicant Qualifications */}
       {data.applicantQualifications && (
          <div>
              <h4 className="text-sm font-medium mb-2">Applicant Qualifications & Experience</h4>
               <div className="p-4 bg-white rounded-md border border-gray-200 space-y-3">
                   {data.applicantQualifications.theologicalTraining && <div><p className="text-xs text-gray-500">Theological Training</p><p className="text-sm flex items-center gap-1"><GraduationCap className="h-4 w-4 text-gray-400"/>{data.applicantQualifications.theologicalTraining}</p></div>}
                   {data.applicantQualifications.previousExperience && <div><p className="text-xs text-gray-500">Previous Experience</p><p className="text-sm">{data.applicantQualifications.previousExperience}</p></div>}
                   {data.applicantQualifications.isOrdained !== undefined && <div><p className="text-xs text-gray-500">Ordained</p><p className="text-sm font-medium">{data.applicantQualifications.isOrdained ? 'Yes' : 'No'}</p></div>}
               </div>
          </div>
       )}

        {/* Intention to Leave */}
        {data.intentionToLeave && (
            <div>
                <h4 className="text-sm font-medium mb-2">Intention After Role</h4>
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 flex items-start gap-2">
                     <CheckSquare className="h-4 w-4 mt-0.5 flex-shrink-0"/>
                     <p>{data.intentionToLeave}</p>
                 </div>
            </div>
         )}


      {/* Supporting Documents */}
       <div>
           <h4 className="text-sm font-medium mb-2">Supporting Documents</h4>
            <div className="space-y-2">
               {data.supportingDocuments?.length > 0 ? (
                  data.supportingDocuments.map((doc: any, index: number) => (
                      <div key={index} className="p-3 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                           <div className="flex-grow">
                               <p className="text-sm font-medium capitalize">{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
                               {doc.fileName && <p className="text-xs text-gray-500 font-mono">{doc.fileName}</p>}
                               {doc.uploadedAt && <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>Uploaded: {formatDate(doc.uploadedAt)}</p>}
                           </div>
                           <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                               {doc.verificationStatus && (
                                   <Badge variant="outline" className={`text-xs ${ doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                       {doc.verificationStatus.charAt(0).toUpperCase() + doc.verificationStatus.slice(1)}
                                   </Badge>
                               )}
                               {doc.fileUrl && (
                                   <Button variant="outline" size="sm" className="h-8" asChild>
                                       <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"> <Eye className="h-3.5 w-3.5 mr-1.5" /> View </a>
                                   </Button>
                               )}
                           </div>
                      </div>
                  ))
               ) : (
                   <div className="p-3 text-center text-gray-500 text-sm bg-gray-50 rounded-md border">
                       <p>No specific religious documents provided in this section</p>
                   </div>
               )}
            </div>
       </div>
    </div>
  );
}


// Helper function assumed to be in utils/formatters.ts
// export const formatCurrency = (value: { amount?: number; currency?: string } | null | undefined): string => { ... }
// export const formatDate = (dateString: string | undefined | null): string => { ... }