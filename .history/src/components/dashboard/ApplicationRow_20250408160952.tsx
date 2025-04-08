// src/components/dashboard/ApplicationRow.tsx
import React from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { Badge } from '@/components/ui/badge';
import { LiveApplication } from '@/types/liveQueue';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatters';
import { CheckCircle, XCircle, Clock, Info, ShieldCheck, AlertTriangle } from 'lucide-react';

// --- Include or import the country code mapping ---
const countryCodeMap: { [key: string]: string } = {
  'Cambodia': 'KH', 'Australia': 'AU', 'United Kingdom': 'GB', 'Spain': 'ES',
  'China': 'CN', 'USA': 'US', 'Egypt': 'EG', /* Add more */
};
const getCountryCode = (countryName: string): string | null => countryCodeMap[countryName] || null;
// --- End mapping ---

interface ApplicationRowProps {
  application: LiveApplication;
  isSelected: boolean;
  onCheckboxChange: (id: string) => void;
  onSelect?: (application: LiveApplication) => void;
}

const getStatusBadgeClass = (status: LiveApplication['status']) => { /* ... as before ... */ };

export default function ApplicationRow({
  application,
  isSelected,
  onCheckboxChange,
  onSelect
}: ApplicationRowProps) {

  const handleRowClick = () => { if (onSelect) { onSelect(application); } };
  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => { e.stopPropagation(); };

  // --- Get the country code for the flag ---
  const countryCode = getCountryCode(application.country);
  // --- Construct flag image path (adjust extension if needed, e.g., .png) ---
  const flagImagePath = countryCode ? `/flags/${countryCode.toUpperCase()}.svg` : null; // Assumes uppercase SVG files

  return (
    <tr
        className={`border-b border-gray-200 hover:bg-gray-50 ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={handleRowClick}
        >
      {/* Checkbox Cell */}
      <td className="py-3 px-4 w-12">
         {/* ... checkbox input ... */}
         <div className="flex items-center justify-center">
           <input type="checkbox" className="rounded border-gray-300" checked={isSelected} onChange={() => onCheckboxChange(application.id)} onClick={handleCheckboxClick} aria-label={`Select application ${application.id}`} />
         </div>
      </td>

      {/* ID Cell */}
      <td className="py-3 px-4">
        {/* ... ID span ... */}
        <span className="font-mono text-xs font-medium text-gray-700">{application.id}</span>
      </td>

      {/* Applicant Cell - MODIFIED */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2"> {/* Flex container for flag + name */}
          {/* Country Flag Image */}
          {flagImagePath ? (
            <Image
              src={flagImagePath}
              alt={`${application.country} flag`}
              width={20} // Adjust size as needed
              height={15} // Adjust size for aspect ratio
              className="rounded-sm flex-shrink-0" // Optional styling
              unoptimized // Necessary for local SVGs in /public if not using a loader
            />
          ) : (
            <div className="w-[20px] h-[15px] bg-gray-200 rounded-sm flex-shrink-0"></div> // Placeholder
          )}
          {/* Name */}
          <span className="block font-medium text-gray-900 truncate" title={application.applicantName}>
            {application.applicantName}
          </span>
        </div>
        {/* Textual Flags (Warnings/Info) - Kept from previous step */}
        {application.flags && application.flags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1 pl-7"> {/* Added padding to align under name */}
                {application.flags.map((flag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-yellow-300 bg-yellow-50 text-yellow-800 font-normal px-1.5 py-0.5">
                         <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0"/> {flag}
                    </Badge>
                ))}
            </div>
        )}
      </td>

      {/* Visa Details Cell */}
      <td className="py-3 px-4">
         {/* ... visa type span ... */}
         <span className="text-gray-800">{application.visaType}</span>
      </td>

      {/* Submitted Date Cell */}
      <td className="py-3 px-4 text-gray-600" suppressHydrationWarning>
         {/* ... formatted date ... */}
          {formatDate(application.submittedDate, { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>

      {/* Status Cell */}
      <td className="py-3 px-4">
         {/* ... status badge ... */}
         <Badge variant="outline" className={`text-xs capitalize ${getStatusBadgeClass(application.status)}`}> {application.status} </Badge>
      </td>

      {/* Assigned To Cell */}
      <td className="py-3 px-4 text-gray-600">
         {/* ... assigned to text ... */}
         {application.assignedTo ? application.assignedTo.name : <span className="text-gray-400 italic">Unassigned</span>}
      </td>
    </tr>
  );
}