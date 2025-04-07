// components/application/SectionCard.tsx (Refactored - Passport Moved Out)
'use client'

import React from 'react';
import { CardFooter } from '@/components/ui/card'; // Keep footer if using its styling
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { ApplicationSection } from '@/types/application';
import { ScanIssue } from '@/types/aiScan';
import { cn } from '@/lib/utils';

// --- Step 1: Import Specific Detail Components ---
// We've done Passport, others are placeholders for now
import PassportSectionDetails from './sections/PassportSectionDetails';
import KycSectionDetails from './sections/KycSectionDetails'; 
import VisaPhotoSectionDetails from './sections/VisaPhotoSectionDetails';
import ExistingVisasSectionDetails from './sections/ExistingVisasSectionDetails';
import ResidencySectionDetails from './sections/ResidencySectionDetails'; 
import ProfessionalSectionDetails from './sections/ProfessionalSectionDetails';
import FinancialSectionDetails from './sections/FinancialSectionDetails'; 
import TravelSectionDetails from './sections/TravelSectionDetails'; 
import TravelInsuranceSectionDetails from './sections/TravelInsuranceSectionDetails';
import DocumentsSectionDetails from './sections/DocumentsSectionDetails'; 
import MedicalSectionDetails from './sections/MedicalSectionDetails';
import ReligiousSectionDetails from './sections/ReligiousSectionDetails';
// ... import others as we create them

// --- Step 2: Define Props (No change needed here) ---
interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  section: ApplicationSection;
  scanIssues?: ScanIssue[];
  onApprove: () => void;
  onRefer: () => void;
  onAddNote: () => void;
  value: string; // For AccordionItem uniqueness
}

// --- Step 3: SectionDetailsRenderer Helper Component ---
// This component decides which specific details component to render
const SectionDetailsRenderer: React.FC<{ section: ApplicationSection }> = ({ section }) => {
  // Check if data and sectionId exist
  if (!section?.data?.sectionId) {
    console.warn("SectionDetailsRenderer: Missing section data or sectionId", section);
    return <div className="p-4 text-gray-500 text-center">No section data available.</div>;
  }

  const { data, data: { sectionId } } = section;

  switch (sectionId) {
    case 'passport':
      // Use the imported component
      return <PassportSectionDetails data={data} />;

    case 'kyc':
      return <KycSectionDetails data={data} />;

    case 'photo':
        return <VisaPhotoSectionDetails data={data} />;

    case 'visas':
        return <ExistingVisasSectionDetails data={data} />;

    case 'residency':
      return <ResidencySectionDetails data={data} />;

  case 'professional':
    return <ProfessionalSectionDetails data={data} />;

   case 'financial':
    return <FinancialSectionDetails data={data} />;

   case 'travel':
     return <TravelSectionDetails data={data} />;

    case 'travelInsurance':
      return <TravelInsuranceSectionDetails data={data} />;

    case 'documents':
      return <DocumentsSectionDetails data={data} />;

      case 'religiousWorker':
    return <ReligiousSectionDetails data={data} />;

    case 'medical':
    return <MedicalSectionDetails data={data} />;

    default:
      // Fallback for sections we haven't created components for yet
      console.warn(`SectionDetailsRenderer: No specific component found for sectionId: ${sectionId}. Displaying generic message.`);
      return (
        <div className="p-4 text-gray-500 text-center">
          Detailed view for section type '{sectionId}' is not yet implemented.
          <pre className="mt-2 text-xs text-left bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
};

// --- Step 4: Main Refactored SectionCard Component ---
export default function SectionCard({
  title,
  icon,
  section,
  scanIssues = [],
  onApprove,
  onRefer,
  onAddNote,
  value
}: SectionCardProps) {

  // --- NO MORE `render...Section` functions here ---

  return (
    <AccordionItem
      value={value}
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white"
    >
      {/* AccordionTrigger displays the header */}
      <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-gray-50 hover:no-underline data-[state=open]:border-b data-[state=open]:bg-gray-50/50">
        {/* Header Content (Icon, Title, Badge) */}
        <div className="flex justify-between items-center w-full">
           <div className="flex items-center space-x-3">
             <div className="text-gray-400 flex-shrink-0">{icon}</div>
             <span className="text-base font-medium text-gray-700 text-left">{title}</span>
           </div>
           <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Validation Status Badge */}
              {section.validationStatus === 'success' && ( <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">Verified</Badge> )}
              {section.validationStatus === 'pending' && ( <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Pending</Badge> )}
              {section.validationStatus === 'error' && ( <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">Error</Badge> )}
           </div>
        </div>
        {/* AI Scan Issues Display */}
        {scanIssues.length > 0 && (
          <div className="mt-2 w-full space-y-1 pr-8">
             {scanIssues.map((issue, index) => (
               <div key={index} className={cn(
                  "p-1.5 text-xs rounded border flex items-start",
                  issue.severity === 'critical' || issue.severity === 'high' ? 'border-red-200 bg-red-50 text-red-700' :
                  issue.severity === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                  'border-blue-200 bg-blue-50 text-blue-700'
                  )}
               >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
                  <div className="text-left">
                     <span className="font-medium capitalize">{issue.type?.replace(/_/g, ' ') || 'Issue'}</span>: <span className="text-gray-600">{issue.message}</span>
                  </div>
               </div>
             ))}
          </div>
        )}
      </AccordionTrigger>

      {/* AccordionContent renders the details using the helper */}
      <AccordionContent className="pt-0 pb-0">
        <div className="p-4 md:p-6 bg-gray-50/70">
           {/* Render the specific details component via the helper */}
           <SectionDetailsRenderer section={section} />
        </div>

        {/* Footer with action buttons */}
        <Separator />
        <CardFooter className="px-4 py-3 flex justify-end space-x-2 bg-white">
           <Button variant="outline" size="sm" onClick={onAddNote} className="text-gray-600 border-gray-300 hover:bg-gray-100"> <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Note </Button>
           <Button variant="outline" size="sm" onClick={onRefer} className="text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"> <AlertCircle className="h-3.5 w-3.5 mr-1.5" /> Refer </Button>
           <Button variant="outline" size="sm" onClick={onApprove} className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100"> <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve </Button>
        </CardFooter>
      </AccordionContent>
    </AccordionItem>
  );
}