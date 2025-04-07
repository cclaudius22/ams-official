// components/application/sections/MedicalSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Hospital, UserCog, FileText as FileTextIcon, DollarSign } from 'lucide-react'; // Renamed FileText to avoid conflict
import { formatDate, formatCurrency } from '@/utils/formatters'; // Assuming formatters are moved to utils

interface MedicalSectionDetailsProps {
  data: any; // Ideally: MedicalData type
}

// Helper to render document info consistently
const DocumentDisplay: React.FC<{ doc: any, title: string }> = ({ doc, title }) => {
    if (!doc) return null;
    return (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <h5 className="text-xs font-medium mb-2 text-gray-600">{title}</h5>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex-grow text-sm">
                    {doc.doctorName && <p>Doctor: <span className="font-medium">{doc.doctorName}</span></p>}
                    {doc.clinicName && <p>Clinic: <span className="font-medium">{doc.clinicName}</span></p>}
                    {doc.issueDate && <p className="text-xs text-gray-500" suppressHydrationWarning>Issued: {formatDate(doc.issueDate)}</p>}
                    {doc.summary && <p className="text-xs text-gray-500 mt-1 italic">Summary: {doc.summary}</p>}
                    {doc.document?.fileName && <p className="text-xs text-gray-500 mt-1 font-mono">{doc.document.fileName}</p>}
                    {doc.document?.uploadedAt && <p className="text-xs text-gray-500" suppressHydrationWarning>Uploaded: {formatDate(doc.document.uploadedAt)}</p>}
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                    {doc.document?.verificationStatus && (
                         <Badge variant="outline" className={`text-xs ${ doc.document.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                             {doc.document.verificationStatus.charAt(0).toUpperCase() + doc.document.verificationStatus.slice(1)}
                         </Badge>
                    )}
                     {doc.document?.fileUrl && (
                        <Button variant="outline" size="sm" className="h-8" asChild>
                           <a href={doc.document.fileUrl} target="_blank" rel="noopener noreferrer"> <Eye className="h-3.5 w-3.5 mr-1.5" /> View </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function MedicalSectionDetails({ data }: MedicalSectionDetailsProps) {
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Medical data provided.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Condition and Treatment */}
      <div>
        <h4 className="text-sm font-medium mb-2">Condition & Treatment</h4>
        <div className="p-4 bg-white rounded-md border border-gray-200 space-y-3">
           {data.primaryCondition && <div><p className="text-xs text-gray-500">Primary Condition</p><p className="text-sm font-medium">{data.primaryCondition}</p></div>}
           {data.treatmentRequired && <div><p className="text-xs text-gray-500">Treatment Required</p><p className="text-sm">{data.treatmentRequired}</p></div>}
           {(data.intendedTreatmentStartDate || data.intendedTreatmentEndDate) && (
              <div className="flex items-center gap-2 text-sm">
                 <Calendar className="h-4 w-4 text-gray-400"/>
                 <span suppressHydrationWarning>
                    {formatDate(data.intendedTreatmentStartDate)} - {formatDate(data.intendedTreatmentEndDate)}
                    {data.estimatedDurationDays && <span className="text-xs text-gray-500 ml-1">({data.estimatedDurationDays} days est.)</span>}
                 </span>
              </div>
            )}
        </div>
      </div>

      {/* Destination Hospital/Clinic */}
      {data.destinationHospitalOrClinic && (
        <div>
           <h4 className="text-sm font-medium mb-2">Destination Facility</h4>
            <div className="p-4 bg-white rounded-md border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
               {data.destinationHospitalOrClinic.name && <div className="sm:col-span-2"><p className="text-xs text-gray-500">Name</p><p className="text-sm font-medium flex items-center gap-1"><Hospital className="h-4 w-4 text-gray-400"/> {data.destinationHospitalOrClinic.name}</p></div>}
               {data.destinationHospitalOrClinic.address && <div><p className="text-xs text-gray-500">Address</p><p className="text-sm">{data.destinationHospitalOrClinic.address}</p></div>}
               {data.destinationHospitalOrClinic.department && <div><p className="text-xs text-gray-500">Department</p><p className="text-sm">{data.destinationHospitalOrClinic.department}</p></div>}
               {data.destinationHospitalOrClinic.consultantName && <div><p className="text-xs text-gray-500">Consultant</p><p className="text-sm font-medium flex items-center gap-1"><UserCog className="h-4 w-4 text-gray-400"/> {data.destinationHospitalOrClinic.consultantName}</p></div>}
            </div>
        </div>
       )}

      {/* Supporting Documents */}
      <div className="space-y-3">
           <DocumentDisplay doc={data.homeCountryDoctorLetter} title="Home Country Doctor's Letter" />
           <DocumentDisplay doc={data.destinationAppointmentConfirmation} title="Appointment Confirmation" />
      </div>

      {/* Proof of Funds for Treatment */}
      {data.proofOfFundsForTreatment && (
          <div>
              <h4 className="text-sm font-medium mb-2">Proof of Funds for Treatment</h4>
               <div className="p-3 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                   <div className="flex-grow text-sm space-y-1">
                       {data.proofOfFundsForTreatment.fundingSource && <p><span className="text-xs text-gray-500">Source:</span> {data.proofOfFundsForTreatment.fundingSource}</p>}
                       {data.proofOfFundsForTreatment.availableAmount && <p><span className="text-xs text-gray-500">Amount:</span> <span className="font-medium">{formatCurrency(data.proofOfFundsForTreatment.availableAmount)}</span></p>}
                       {data.proofOfFundsForTreatment.document?.fileName && <p className="text-xs text-gray-500 mt-1 font-mono">{data.proofOfFundsForTreatment.document.fileName}</p>}
                   </div>
                    <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                       {data.proofOfFundsForTreatment.document?.verificationStatus && (
                           <Badge variant="outline" className={`text-xs ${ data.proofOfFundsForTreatment.document.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                               {data.proofOfFundsForTreatment.document.verificationStatus.charAt(0).toUpperCase() + data.proofOfFundsForTreatment.document.verificationStatus.slice(1)}
                           </Badge>
                       )}
                       {data.proofOfFundsForTreatment.document?.fileUrl && (
                           <Button variant="outline" size="sm" className="h-8" asChild>
                               <a href={data.proofOfFundsForTreatment.document.fileUrl} target="_blank" rel="noopener noreferrer"> <Eye className="h-3.5 w-3.5 mr-1.5" /> View Doc </a>
                           </Button>
                       )}
                   </div>
               </div>
          </div>
       )}

    </div>
  );
}