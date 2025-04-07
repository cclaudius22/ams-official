// components/application/sections/SponsorshipAndRoleDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Banknote, Clock, CalendarCheck2, CheckCircle, CircleDotDashed } from 'lucide-react'; // Import icons
import { formatDate, formatCurrency } from '@/utils/formatters'; // Assuming formatters
import { cn } from '@/lib/utils';

interface SponsorshipAndRoleDetailsProps {
  data: any; // Ideally: SponsorshipData type
}

// Helper to display Employer Info
const EmployerInfo: React.FC<{ employer: any, title: string }> = ({ employer, title }) => {
    if (!employer) return null;
    return (
        <div>
            <h5 className="text-xs font-medium mb-1 text-gray-600">{title}</h5>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm space-y-1">
                {employer.name && <p className="font-semibold flex items-center gap-1.5"><Building className="h-4 w-4 text-gray-400 flex-shrink-0"/> {employer.name}</p>}
                {employer.address && <p className="text-xs text-gray-600 pl-6">{employer.address}</p>}
                {employer.sponsorLicenseNumber && <p className="text-xs pl-6"><span className="text-gray-500">License:</span> <span className="font-mono">{employer.sponsorLicenseNumber}</span></p>}
                {employer.natureOfBusiness && <p className="text-xs pl-6"><span className="text-gray-500">Business:</span> {employer.natureOfBusiness}</p>}
            </div>
        </div>
    );
};

// Helper to display Role Info
const RoleInfo: React.FC<{ role: any, title: string }> = ({ role, title }) => {
     if (!role) return null;
     return (
        <div>
            <h5 className="text-xs font-medium mb-1 text-gray-600">{title}</h5>
             <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm space-y-2">
                 {role.jobTitle && <p className="font-semibold flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0"/> {role.jobTitle}</p>}
                 {role.socCode && <p className="text-xs pl-6"><span className="text-gray-500">SOC Code:</span> <span className="font-mono">{role.socCode}</span></p>}
                 {role.salaryGbpAnnual && <p className="text-xs pl-6 flex items-center gap-1"><Banknote className="h-3 w-3 text-gray-400 flex-shrink-0"/> Salary: <span className="font-medium">{formatCurrency({ amount: role.salaryGbpAnnual, currency: 'GBP' })} / year</span></p>}
                 {role.workHoursWeekly && <p className="text-xs pl-6 flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400 flex-shrink-0"/> Hours: {role.workHoursWeekly} / week</p>}
                 {(role.startDate || role.endDate) && (
                    <p className="text-xs pl-6 flex items-center gap-1" suppressHydrationWarning>
                        <CalendarCheck2 className="h-3 w-3 text-gray-400 flex-shrink-0"/>
                         Dates: {formatDate(role.startDate)} - {formatDate(role.endDate) || 'Ongoing'}
                    </p>
                 )}
                 {role.mainDutiesSummary && <p className="text-xs text-gray-600 pl-6 mt-1 pt-1 border-t border-gray-100">Duties Summary: {role.mainDutiesSummary}</p>}
             </div>
        </div>
     );
};

export default function SponsorshipAndRoleDetails({ data }: SponsorshipAndRoleDetailsProps) {
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Sponsorship or Role data provided.</div>;
  }

  const cos = data.certificateOfSponsorship;
  const localEmployer = data.localEmployer;
  const localRole = data.localRole;
  const overseas = data.overseasEmployment; // May be null for Skilled Worker

  return (
    <div className="space-y-5">
      {/* Certificate of Sponsorship */}
      {cos && (
        <div>
          <h4 className="text-sm font-medium mb-2">Certificate of Sponsorship (CoS)</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                <div><p className="text-xs text-gray-500">CoS Number</p><p className="text-sm font-mono font-medium">{cos.cosNumber || 'N/A'}</p></div>
                <div><p className="text-xs text-gray-500">Status</p>
                    <Badge variant={cos.status?.toLowerCase() === 'assigned' ? 'success' : 'outline'} className="capitalize">
                         {cos.status?.toLowerCase() === 'assigned' ? <CheckCircle className="h-3 w-3 mr-1"/> : <CircleDotDashed className="h-3 w-3 mr-1"/> }
                         {cos.status || 'N/A'}
                    </Badge>
                </div>
                <div><p className="text-xs text-gray-500">Issue Date</p><p className="text-sm" suppressHydrationWarning>{formatDate(cos.issueDate)}</p></div>
                <div><p className="text-xs text-gray-500">Expiry Date</p><p className="text-sm" suppressHydrationWarning>{formatDate(cos.expiryDate)}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Employer & Role Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Employer & Role */}
          <div className="space-y-3">
             <EmployerInfo employer={localEmployer} title="UK Sponsoring Employer" />
             <RoleInfo role={localRole} title="UK Role (as per CoS)" />
          </div>

          {/* Overseas Employer & Role (Specific to ICT) */}
          {overseas && (
             <div className="space-y-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 border-gray-200 border-dashed">
                 <EmployerInfo employer={{ name: overseas.employerName, address: overseas.employerAddress, natureOfBusiness: overseas.natureOfBusiness }} title="Overseas Employer" />
                  <div>
                      <h5 className="text-xs font-medium mb-1 text-gray-600">Overseas Role</h5>
                       <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm space-y-2">
                           {overseas.jobTitle && <p className="font-semibold flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0"/> {overseas.jobTitle}</p>}
                           {overseas.startDate && <p className="text-xs pl-6" suppressHydrationWarning><span className="text-gray-500">Started:</span> {formatDate(overseas.startDate)}</p>}
                           {overseas.continuousEmploymentVerified !== undefined && (
                                <p className="text-xs pl-6 flex items-center gap-1">
                                   {overseas.continuousEmploymentVerified ? <CheckCircle className="h-3 w-3 text-green-500"/> : <XCircle className="h-3 w-3 text-red-500"/> }
                                    Min. Employment Period Met: {overseas.continuousEmploymentVerified ? 'Yes' : 'No'}
                                </p>
                            )}
                            {overseas.overseasSalaryOriginal && <p className="text-xs pl-6"><span className="text-gray-500">Overseas Salary:</span> {formatCurrency(overseas.overseasSalaryOriginal)}</p>}
                       </div>
                  </div>
             </div>
           )}
      </div>

    </div>
  );
}


// Added XCircle to imports
import { XCircle } from 'lucide-react';
// Assumed formatters exist in utils/formatters.ts
// Assumed Badge variant 'success' exists or add it:
/*
const badgeVariants = cva(
  "...", { variants: { variant: { success: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80", ...} } }
)
*/