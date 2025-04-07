// components/application/sections/ExistingVisasSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Clock, CalendarDays, Info, ShieldCheck } from 'lucide-react'; // Added icons
import { formatDate } from '@/utils/formatters'; // Assuming date formatter
import { cn } from '@/lib/utils';

interface ExistingVisasSectionDetailsProps {
  data: any; // Ideally: ExistingVisasData type
}

// Helper component for individual visa item
const VisaItem: React.FC<{ visa: any }> = ({ visa }) => {

    const getStatusProps = (status: string | undefined, expiryDate: string | null | undefined) => {
         const isPermanent = expiryDate === null;
         const isExpired = expiryDate && new Date(expiryDate) < new Date();

         // Override status if clearly expired based on date
         const currentStatus = isExpired ? 'expired' : status?.toLowerCase();

         switch (currentStatus) {
            case 'active':
                if (isPermanent) {
                    return { text: 'Active (Permanent)', color: 'text-green-700 bg-green-100 border-green-200', icon: ShieldCheck };
                }
                 return { text: 'Active', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle };
            case 'expired':
                return { text: 'Expired', color: 'text-gray-500 bg-gray-100 border-gray-200', icon: Clock };
            case 'revoked':
            case 'cancelled':
                return { text: status || 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle };
            default:
                return { text: status || 'Unknown', color: 'text-gray-500 bg-gray-100 border-gray-200', icon: Info };
         }
    };

    const statusProps = getStatusProps(visa.status, visa.expiryDate);
    const StatusIcon = statusProps.icon;

    return (
        <div className="p-3 bg-white rounded-md border border-gray-200 space-y-2">
            {/* Top Row: Type, Country, Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <p className="text-sm font-medium">{visa.visaType || 'Unknown Visa Type'}</p>
                    <p className="text-xs text-gray-500">Issued by: {visa.issuingCountry || 'N/A'}</p>
                     {visa.visaNumber && <p className="text-xs text-gray-500">Number: <span className="font-mono">{visa.visaNumber}</span></p>}
                </div>
                <Badge variant="outline" className={cn("text-xs capitalize self-start sm:self-center", statusProps.color)}>
                     <StatusIcon className="h-3.5 w-3.5 mr-1" /> {statusProps.text}
                </Badge>
            </div>

             {/* Dates */}
             {(visa.issueDate || visa.expiryDate !== undefined) && (
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                   <CalendarDays className="h-3.5 w-3.5 text-gray-400"/>
                   <span suppressHydrationWarning>
                       Issued: {formatDate(visa.issueDate) || 'N/A'}
                       <span className="mx-2">|</span>
                       Expiry: {visa.expiryDate === null ? <span className="font-medium text-green-700">Permanent</span> : formatDate(visa.expiryDate) || 'N/A'}
                   </span>
                </div>
             )}

              {/* Notes & Document */}
               {(visa.notes || visa.document) && (
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-gray-100">
                       {visa.notes && <p className="text-xs text-gray-600 italic flex-grow">Note: {visa.notes}</p>}
                       {visa.document?.fileUrl && (
                           <Button variant="outline" size="sm" className="h-8 flex-shrink-0 self-end sm:self-center" asChild>
                               <a href={visa.document.fileUrl} target="_blank" rel="noopener noreferrer"> <Eye className="h-3.5 w-3.5 mr-1.5" /> View Doc </a>
                           </Button>
                       )}
                   </div>
               )}
        </div>
    );
};


export default function ExistingVisasSectionDetails({ data }: ExistingVisasSectionDetailsProps) {
  if (!data || !data.previousVisas || data.previousVisas.length === 0) {
    // Check for the explicit flag if available
    if (data && data.hasPreviousVisas === false) {
        return <div className="p-4 text-center text-gray-500">Applicant declared no previous visas.</div>;
    }
    return <div className="p-4 text-center text-gray-500">No existing visa information provided.</div>;
  }

  return (
    <div className="space-y-3">
       <h4 className="text-sm font-medium mb-1">Existing Visas & Immigration Status</h4>
       {data.previousVisas.map((visa: any, index: number) => (
          <VisaItem key={index} visa={visa} />
       ))}
    </div>
  );
}