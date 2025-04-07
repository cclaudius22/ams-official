// components/application/sections/VisaPhotoSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Info, CameraOff } from 'lucide-react'; // Import icons
import { cn } from '@/lib/utils';

interface VisaPhotoSectionDetailsProps {
  data: any; // Ideally: VisaPhotoData type
}

// Helper to render verification check results
const VerificationCheck: React.FC<{ title: string; checkData: any; scoreThreshold?: number }> = ({ title, checkData, scoreThreshold }) => {
    if (!checkData) return null;

    let Icon = AlertTriangle;
    let colorClass = "text-amber-600 bg-amber-50 border-amber-200";
    let statusText = checkData.status?.replace(/_/g, ' ') || 'Pending';

    switch (checkData.status?.toLowerCase()) {
        case 'passed':
        case 'match':
            Icon = CheckCircle2;
            colorClass = "text-green-600 bg-green-50 border-green-200";
            break;
        case 'failed':
        case 'no_match':
            Icon = XCircle;
            colorClass = "text-red-600 bg-red-50 border-red-200";
            break;
        case 'warning':
        case 'possible_match':
             Icon = AlertTriangle;
             colorClass = "text-amber-600 bg-amber-50 border-amber-200";
             break;
        case 'not_available':
             Icon = Info;
             colorClass = "text-gray-500 bg-gray-50 border-gray-200";
             statusText = "Not Available";
             break;
    }

     // Add warning if score is below threshold but status is match/possible_match
     if (scoreThreshold && checkData.score != null && checkData.score < scoreThreshold && (checkData.status === 'match' || checkData.status === 'possible_match')) {
         Icon = AlertTriangle;
         colorClass = "text-amber-600 bg-amber-50 border-amber-200"; // Override to warning
     }

    return (
        <div className={cn("p-3 rounded border", colorClass)}>
            <div className="flex justify-between items-center mb-1">
                 <h5 className="text-sm font-medium flex items-center gap-1.5">
                     <Icon className="h-4 w-4 flex-shrink-0" />
                     {title}
                 </h5>
                 <Badge variant="outline" className={cn("capitalize text-xs", colorClass)}>{statusText}</Badge>
            </div>
             {checkData.score != null && (
                 <p className="text-xs pl-6">Confidence Score: <span className="font-semibold">{checkData.score}%</span> {scoreThreshold && `(Threshold: ${scoreThreshold}%)`}</p>
             )}
             {/* List compliance issues */}
             {checkData.issuesFound && checkData.issuesFound.length > 0 && (
                 <div className="mt-2 pl-6 text-xs space-y-0.5">
                     <p className="font-medium">Issues Found:</p>
                     <ul className="list-disc pl-4">
                        {checkData.issuesFound.map((issue: any, index: number) => (
                            <li key={index}>
                                <span className="font-semibold capitalize">{issue.check?.replace(/_/g, ' ')}:</span> {issue.message}
                            </li>
                        ))}
                     </ul>
                 </div>
             )}
        </div>
    );
};


export default function VisaPhotoSectionDetails({ data }: VisaPhotoSectionDetailsProps) {
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Visa Photo data provided.</div>;
  }

  const checks = data.verificationChecks || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Left Column: Photo */}
      <div className="md:col-span-1 flex flex-col items-center">
        <h4 className="text-sm font-medium mb-2 self-start">Submitted Photo</h4>
        {data.photoUrl ? (
          <img
            src={data.photoUrl}
            alt="Submitted Visa Photo"
            className="w-full max-w-[250px] aspect-[4/5] object-cover rounded-md border shadow-sm" // Aspect ratio typical for visa photos
          />
        ) : (
            <div className="w-full max-w-[250px] aspect-[4/5] bg-gray-100 rounded-md border flex flex-col items-center justify-center text-gray-400">
                <CameraOff className="h-12 w-12 mb-2"/>
                <span className="text-sm">No Photo Available</span>
            </div>
        )}
        {/* Optional Metadata */}
        {data.metadata && (
            <div className="text-xs text-gray-500 mt-2 space-y-0.5 text-center md:text-left w-full max-w-[250px]">
                {data.metadata.dimensions && <p>Dimensions: {data.metadata.dimensions}px</p>}
                {data.metadata.fileSizeKB && <p>Size: {data.metadata.fileSizeKB} KB ({data.metadata.format})</p>}
                {data.uploadTimestamp && <p suppressHydrationWarning>Uploaded: {new Date(data.uploadTimestamp).toLocaleString('en-GB')}</p>}
            </div>
        )}
      </div>

      {/* Right Column: Verification Checks */}
      <div className="md:col-span-2 space-y-3">
         <h4 className="text-sm font-medium mb-2">Verification Analysis</h4>
         <VerificationCheck title="Photo Requirements Compliance" checkData={checks.complianceCheck} />
         <VerificationCheck title="Match vs Passport Photo" checkData={checks.passportMatch} scoreThreshold={80}/>
         <VerificationCheck title="Match vs KYC Selfie" checkData={checks.kycMatch} scoreThreshold={80}/>

         {/* Overall Status & Notes */}
          {checks.overallStatus && (
              <div className={`mt-4 p-3 rounded border text-sm flex items-start gap-2 ${
                   checks.overallStatus === 'verified' ? 'bg-green-50 border-green-200 text-green-700' :
                   checks.overallStatus === 'issues_found' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                   'bg-gray-50 border-gray-200 text-gray-600' // Pending or other
              }`}>
                  {checks.overallStatus === 'verified' ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0"/> :
                   checks.overallStatus === 'issues_found' ? <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0"/> :
                   <Info className="h-4 w-4 mt-0.5 flex-shrink-0"/> }
                   <div>
                      <span className="font-semibold capitalize">Overall Status: {checks.overallStatus.replace(/_/g, ' ')}</span>
                      {checks.verificationNotes && <p className="text-xs mt-1">{checks.verificationNotes}</p>}
                   </div>
              </div>
          )}
      </div>
    </div>
  );
}