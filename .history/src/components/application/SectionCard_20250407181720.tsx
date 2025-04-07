// components/application/SectionCard.tsx (or your file name)
'use client'

import React from 'react'
// Removed Card, CardHeader, CardContent as we use Accordion components now
import { CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion" // Import Accordion components
import { AlertTriangle, CheckCircle2, AlertCircle, MessageCircle, Eye } from 'lucide-react'
// Removed ChevronDown, ChevronUp
import { ApplicationSection } from '@/types/application'
import { ScanIssue } from '@/types/aiScan'
import { cn } from '@/lib/utils' // Import cn utility

// Format a date string (no changes needed)
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
}

// Calculate duration (no changes needed)
const calculateDuration = (startDate: string | undefined | null, endDate: string | undefined | null): string => {
    if (!startDate || !endDate) return '';
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''; // Check for invalid dates

        // Ensure end date is after start date
        if (end < start) return ''; 
        
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        // Simple rounding for days affecting month calc isn't robust, focus on years/months
        // const dayDiff = end.getDate() - start.getDate();
        // if (dayDiff < 0) { months--; } // Basic check

        if (years < 0) return ''; // Should not happen if end >= start

        const yearString = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
        const monthString = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

        if (yearString && monthString) return `${yearString}, ${monthString}`;
        if (yearString) return yearString;
        if (monthString) return monthString;
        return 'Less than a month'; // Or handle zero duration case

    } catch (e) {
        console.error("Error calculating duration:", startDate, endDate, e);
        return '';
    }
}

// Define props for SectionCard
interface SectionCardProps {
  title: string
  icon: React.ReactNode
  section: ApplicationSection
  scanIssues?: ScanIssue[]
  onApprove: () => void
  onRefer: () => void
  onAddNote: () => void
  // Add value prop for AccordionItem uniqueness
  value: string
}

// Define props for the parent component that wraps SectionCard instances
interface SectionsAccordionProps {
  children: React.ReactNode;
  // Allow controlling which sections are open by default
  defaultOpenSections?: string[];
}

// Parent Accordion Wrapper (Optional but recommended)
// You would use this in the parent component where you map over sections
export const SectionsAccordion: React.FC<SectionsAccordionProps> = ({ children, defaultOpenSections }) => {
  return (
    <Accordion
      type="multiple" // Allow multiple sections to be open
      // defaultValue={defaultOpenSections} // Uncomment if you want specific sections open by default
      className="w-full space-y-3" // Add some space between accordion items
    >
      {children}
    </Accordion>
  );
};


// --- Main SectionCard Component ---
export default function SectionCard({
  title,
  icon,
  section,
  scanIssues = [],
  onApprove,
  onRefer,
  onAddNote,
  value // Receive value from parent
}: SectionCardProps) {
  // Removed useState for 'expanded'

  // --- Rendering functions (renderPassportSection, renderKycSection, etc.) remain the same ---
  // Make sure they handle potential null/undefined data gracefully
   const renderPassportSection = (data: any) => {
    // Check if data exists
    if (!data) return <div className="p-4 text-center text-gray-500">No Passport data available.</div>;
    
    return (
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row">
          {/* Passport Photo */}
          <div className="w-full md:w-1/3 pr-0 md:pr-5 mb-4 md:mb-0">
            <p className="text-sm text-gray-500 mb-2">Passport Photo</p>
            <div className="border rounded-md overflow-hidden mb-2 max-w-[200px] mx-auto md:mx-0"> {/* Constrained width */}
              <img 
                src={data.passportPhotoUrl || 'https://placehold.co/200x250/png?text=No+Photo'}
                alt="Passport Photo"
                className="w-full h-auto object-cover" // Added object-cover
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Scan Quality: {data.scanQuality || 'N/A'}</span>
              <span>Score: {data.verificationScore || 'N/A'}</span>
            </div>
          </div>
          {/* Passport Details */}
          <div className="w-full md:w-2/3">
            <h4 className="text-sm font-medium mb-2">Passport Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Simplified rendering for brevity, add checks for each field */}
              <div><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium">{data.surname || 'N/A'}, {data.givenNames || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Nationality</p><p className="text-sm font-medium">{data.nationality || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Passport Number</p><p className="text-sm font-medium">{data.documentNumber || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Document Type</p><p className="text-sm font-medium">{data.documentType || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Date of Birth</p><p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.dateOfBirth)}</p></div>
              <div><p className="text-xs text-gray-500">Gender</p><p className="text-sm font-medium">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Issue Date</p><p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.issueDate)}</p></div>
              <div><p className="text-xs text-gray-500">Expiry Date</p><p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.dateOfExpiry)}</p></div>
              <div><p className="text-xs text-gray-500">Issuing Country</p><p className="text-sm font-medium">{data.issuingCountry || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Place of Issue</p><p className="text-sm font-medium">{data.placeOfIssue || 'N/A'}</p></div>
            </div>
          </div>
        </div>
        {/* MRZ Data Section */}
        {data.mrzData ? (
          <div>
            <h4 className="text-sm font-medium mb-2">Machine Readable Zone (MRZ)</h4>
            <div className="bg-gray-100 p-2 font-mono text-sm rounded border border-gray-200 break-all mb-3">
              <div>{data.mrzData.line1 || ''}</div>
              <div>{data.mrzData.line2 || ''}</div>
            </div>
            {/* ... MRZ details grid ... */}
          </div>
        ) : (
           <div className="py-2 text-sm text-gray-500">No MRZ data available</div>
        )}
        {/* Verification Information */}
        <div>
          <h4 className="text-sm font-medium mb-2">Verification Information</h4>
          {/* ... Verification details grid ... */}
        </div>
      </div>
    )
  }
  const renderKycSection = (data: any) => {
     if (!data) return <div className="p-4 text-center text-gray-500">No KYC data available.</div>;
     // Rest of the renderKycSection implementation
     return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row">
          {/* Selfie Photo */}
           <div className="w-full md:w-1/3 pr-0 md:pr-4 mb-4 md:mb-0">
             <p className="text-sm text-gray-500 mb-2">Verified Selfie</p>
             <div className="border rounded-md overflow-hidden mb-2 max-w-[200px] mx-auto md:mx-0"> {/* Constrained width */}
               <img 
                  src={data.selfieImageUrl || 'https://placehold.co/200x200/png?text=No+Selfie'}
                  alt="Verified Selfie"
                  className="w-full h-auto object-cover" // Added object-cover
               />
            </div>
           </div>
           {/* KYC Details */}
           <div className="w-full md:w-2/3 space-y-3">
            {/* Facematch Score */}
            <div>
              <p className="text-sm text-gray-500">Facematch Score</p>
              <div className="flex items-center">
                <div className="h-2 bg-gray-200 rounded-full w-full mr-2 overflow-hidden"> {/* Added overflow-hidden */}
                    <div 
                       className={cn('h-2 rounded-full', 
                          data.facematchScore == null ? 'bg-gray-300' : 
                          data.facematchScore >= 90 ? 'bg-green-500' : 
                          data.facematchScore >= 70 ? 'bg-amber-500' : 'bg-red-500')} // Added more levels and null check
                       style={{ width: `${data.facematchScore ?? 0}%` }} // Use ?? 0 for null scores
                    ></div>
                 </div>
                 <span className="text-sm font-medium">{data.facematchScore != null ? `${data.facematchScore}%` : 'N/A'}</span> {/* Handle null display */}
               </div>
            </div>
             {/* Liveness Score */}
            <div>
              <p className="text-sm text-gray-500">Liveness Score</p>
               <div className="flex items-center">
                 <div className="h-2 bg-gray-200 rounded-full w-full mr-2 overflow-hidden"> {/* Added overflow-hidden */}
                    <div 
                       className={cn('h-2 rounded-full', 
                          data.livenessScore == null ? 'bg-gray-300' : 
                          data.livenessScore >= 90 ? 'bg-green-500' : 
                          data.livenessScore >= 70 ? 'bg-amber-500' : 'bg-red-500')} // Added more levels and null check
                       style={{ width: `${data.livenessScore ?? 0}%` }} // Use ?? 0 for null scores
                    ></div>
                 </div>
                 <span className="text-sm font-medium">{data.livenessScore != null ? `${data.livenessScore}%` : 'N/A'}</span> {/* Handle null display */}
               </div>
            </div>
             {/* Liveness Checks */}
             {data.livenessChecks?.length > 0 && (
                <div>
                   <p className="text-sm text-gray-500">Liveness Checks</p>
                   <div className="flex flex-wrap gap-1 mt-1">
                      {data.livenessChecks.map((check: string, index: number) => (
                         <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-xs capitalize">
                            {check.replace(/_/g, ' ')} {/* Replace underscores */}
                         </Badge>
                      ))}
                   </div>
                </div>
             )}
             {/* Completed At */}
             {data.completedAt && (
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p className="font-medium text-sm" suppressHydrationWarning>
                     {new Date(data.completedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                   </p>
                </div>
             )}
             {/* Device Information */}
             {data.metadataCapture && (
               <div>
                  <p className="text-sm text-gray-500">Device Information</p>
                  <div className="text-sm">
                     {data.metadataCapture.deviceModel && <p>Device: {data.metadataCapture.deviceModel}</p>}
                     {data.metadataCapture.location && (
                        <p>Location Approx: {data.metadataCapture.location.latitude?.toFixed(4)}, {data.metadataCapture.location.longitude?.toFixed(4)}</p>
                     )}
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>
     )
  }
  const renderResidencySection = (data: any) => {
      if (!data) return <div className="p-4 text-center text-gray-500">No Residency data available.</div>;
       // Rest of the renderResidencySection implementation
      return <div>Residency Details...</div>; // Placeholder
  }
  const renderTravelSection = (data: any) => {
       if (!data) return <div className="p-4 text-center text-gray-500">No Travel data available.</div>;
        // Rest of the renderTravelSection implementation
       return <div>Travel Details...</div>; // Placeholder
  }
  const renderFinancialSection = (data: any) => {
       if (!data) return <div className="p-4 text-center text-gray-500">No Financial data available.</div>;
        // Rest of the renderFinancialSection implementation
       return <div>Financial Details...</div>; // Placeholder
  }
  const renderProfessionalSection = (data: any) => {
       if (!data) return <div className="p-4 text-center text-gray-500">No Professional data available.</div>;
        // Rest of the renderProfessionalSection implementation
       return <div>Professional Details...</div>; // Placeholder
  }
   // --- End of Render Functions ---


  // Decide which section to render based on section.data.sectionId
  const renderSectionContent = () => {
    // Check if section.data exists before trying to access sectionId
    if (!section?.data) {
      return (
        <div className="py-4 text-gray-500 text-center">
          <p>No data provided for this section.</p>
        </div>
      );
    }

    const { data } = section;
    switch (data.sectionId) {
      case 'passport':
        return renderPassportSection(data);
      case 'kyc':
        return renderKycSection(data);
      case 'residency':
        return renderResidencySection(data);
      case 'professional':
        return renderProfessionalSection(data);
      case 'financial':
        return renderFinancialSection(data);
      case 'travel':
        return renderTravelSection(data);
      default:
        return (
          <div className="py-4 text-gray-500 text-center">
            <p>No detailed information available for section ID: {data.sectionId}</p>
          </div>
        );
    }
  }

  // --- Main Return using Accordion ---
  return (
    // Each card is now an AccordionItem
    <AccordionItem
        value={value} // Use the unique value prop passed from parent
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white" // Style the item like a card
      >
      {/* AccordionTrigger contains the always-visible header content */}
      <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-gray-50 hover:no-underline data-[state=open]:border-b data-[state=open]:bg-gray-50/50">
        {/* Flex container for the main header row */}
        <div className="flex justify-between items-center w-full">
           <div className="flex items-center space-x-3"> {/* Increased spacing */}
             <div className="text-gray-400 flex-shrink-0">{icon}</div>
             <span className="text-base font-medium text-gray-700 text-left">{title}</span> {/* Text left aligned */}
           </div>
           <div className="flex items-center space-x-2 flex-shrink-0"> {/* Badges and Chevron */}
              {/* Status Badge */}
              {section.validationStatus === 'success' && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">Verified</Badge>
              )}
              {section.validationStatus === 'pending' && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Pending</Badge>
              )}
              {section.validationStatus === 'error' && (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">Error</Badge>
              )}
              {/* Chevron icon is added automatically by AccordionTrigger, but kept here if explicit styling needed */}
           </div>
        </div>

        {/* AI Scan Issues (shown below main header row, but still inside trigger) */}
        {scanIssues.length > 0 && (
          <div className="mt-2 w-full space-y-1 pr-8"> {/* Added pr-8 to avoid overlap with chevron */}
            {scanIssues.map((issue, index) => (
              <div
                key={index}
                className={cn(
                  "p-1.5 text-xs rounded border flex items-start", // Adjusted padding/text size
                  issue.severity === 'critical' || issue.severity === 'high' ? 'border-red-200 bg-red-50 text-red-700' :
                  issue.severity === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                  'border-blue-200 bg-blue-50 text-blue-700'
                )}
                // Prevent click on issue from toggling accordion if needed
                // onClick={(e) => e.stopPropagation()}
              >
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
                <div className="text-left"> {/* Ensure text aligns left */}
                  <span className="font-medium capitalize">{issue.type?.replace(/_/g, ' ') || 'Issue'}</span>: <span className="text-gray-600">{issue.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AccordionTrigger>

      {/* AccordionContent holds the collapsible details */}
      <AccordionContent className="pt-0 pb-0"> {/* Remove default padding */}
          {/* Optional Separator */}
          {/* <Separator className="mb-4" /> */}
          {/* Add padding within this div */}
          <div className="p-4 md:p-6 bg-gray-50/70">
             {renderSectionContent()}
          </div>

          {/* Footer with action buttons */}
          <Separator />
          <CardFooter className="px-4 py-3 flex justify-end space-x-2 bg-white"> {/* Keep footer visible */}
             <Button
                variant="outline"
                size="sm"
                onClick={onAddNote}
                className="text-gray-600 border-gray-300 hover:bg-gray-100" // Subtle styling
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefer}
                className="text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100" // Warning styling
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                Refer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onApprove}
                className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100" // Success styling
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
          </CardFooter>
      </AccordionContent>
    </AccordionItem>
  )
}