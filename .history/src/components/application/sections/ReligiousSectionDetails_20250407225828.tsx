// components/application/sections/ReligiousSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Building, Briefcase, GraduationCap, HandCoins, CheckSquare } from 'lucide-react';
// VVVVV --- ADD OR VERIFY THIS LINE --- VVVVV
import { formatDate, formatCurrency } from '@/utils/formatters'; // Import formatDate here
// ^^^^^ --- ADD OR VERIFY THIS LINE --- ^^^^^

interface ReligiousSectionDetailsProps {
  data: any;
}

export default function ReligiousSectionDetails({ data }: ReligiousSectionDetailsProps) {
  if (!data) {
    // ... null check ...
  }

  const formatSalaryFreq = (salary: { amount?: number; currency?: string, frequency?: string } | null | undefined): string => {
      if (!salary?.amount || !salary?.currency || !salary.frequency) return 'N/A';
      // Ensure formatCurrency is available here too (it is due to the import above)
      const formattedAmount = formatCurrency(salary);
      if (formattedAmount === 'N/A') return 'N/A';
      return `${formattedAmount} (${salary.frequency})`;
  }

  return (
    <div className="space-y-5">
      {/* ... other parts ... */}
      {/* Role Details */}
      {data.roleDetails && (
        <div>
          {/* ... */}
          <div className="p-4 bg-white rounded-md border border-gray-200 space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                 {/* ... */}
                 {(data.roleDetails.startDate || data.roleDetails.durationMonths) && (
                     <div>
                         <p className="text-xs text-gray-500">Period</p>
                         <p className="text-sm" suppressHydrationWarning>
                            {/* Ensure formatDate is used here */}
                            {formatDate(data.roleDetails.startDate)} {data.roleDetails.durationMonths ? `(for ${data.roleDetails.durationMonths} months)`: ''}
                         </p>
                     </div>
                 )}
                 {/* ... */}
             </div>
             {/* ... */}
          </div>
        </div>
      )}

      {/* Supporting Documents */}
       <div>
           <h4 className="text-sm font-medium mb-2">Supporting Documents</h4>
            <div className="space-y-2">
               {data.supportingDocuments?.length > 0 ? (
                  data.supportingDocuments.map((doc: any, index: number) => (
                      <div key={index} /* ... */>
                           <div className="flex-grow">
                               {/* ... */}
                               {/* Ensure formatDate is used here */}
                               {doc.uploadedAt && <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>Uploaded: {formatDate(doc.uploadedAt)}</p>}
                           </div>
                           {/* ... */}
                      </div>
                  ))
               ) : ( /* ... */ )}
            </div>
       </div>
    </div>
  );
}