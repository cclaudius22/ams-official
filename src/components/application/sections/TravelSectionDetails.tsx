// components/application/sections/TravelSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils'; // Assuming date util

// Define specific props - Replace 'any' with a defined TravelData type if you have one
interface TravelSectionDetailsProps {
  data: any; // Ideally: TravelData type
}

export default function TravelSectionDetails({ data }: TravelSectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Travel data provided.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Trip Dates & Details */}
      {/* Render only if dates are present */}
      {(data.dateOfArrival || data.dateOfDeparture || data.durationOfStayDays || data.intendedEntries) && (
        <div>
          <h4 className="text-sm font-medium mb-2">Trip Information</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
               {data.dateOfArrival && <div><p className="text-xs text-gray-500">Date of Arrival</p><p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.dateOfArrival)}</p></div>}
               {data.dateOfDeparture && <div><p className="text-xs text-gray-500">Date of Departure</p><p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.dateOfDeparture)}</p></div>}
               {data.durationOfStayDays && <div><p className="text-xs text-gray-500">Duration of Stay</p><p className="text-sm font-medium">{data.durationOfStayDays} days</p></div>}
               {data.intendedEntries && <div><p className="text-xs text-gray-500">Intended Entries</p><p className="text-sm font-medium capitalize">{data.intendedEntries.replace(/_/g, ' ')}</p></div>}
               {data.arrivalPort && <div><p className="text-xs text-gray-500">Port/City of Arrival</p><p className="text-sm font-medium">{data.arrivalPort}</p></div>}
               {data.departurePort && <div><p className="text-xs text-gray-500">Port/City of Departure</p><p className="text-sm font-medium">{data.departurePort}</p></div>}
               {data.modeOfTransport && <div><p className="text-xs text-gray-500">Mode of Transport</p><p className="text-sm font-medium capitalize">{data.modeOfTransport.replace(/_/g, ' ')}</p></div>}
               {data.purposeOfVisit && <div className="sm:col-span-2"><p className="text-xs text-gray-500">Purpose of Visit</p><p className="text-sm font-medium">{data.purposeOfVisit}</p></div>}
            </div>
          </div>
        </div>
       )}

      {/* Accommodation Details */}
      {data.accommodation && (
        <div>
          <h4 className="text-sm font-medium mb-2">Accommodation Details</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200 space-y-4"> {/* Added space-y */}
            {/* Accommodation Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
               {data.accommodation.type && <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium capitalize">{data.accommodation.type.replace(/_/g, ' ')}</p></div>}
               {data.accommodation.name && <div><p className="text-xs text-gray-500">Name / Host</p><p className="text-sm font-medium">{data.accommodation.name}</p></div>}
               {data.accommodation.contactPerson && <div><p className="text-xs text-gray-500">Contact Person</p><p className="text-sm font-medium">{data.accommodation.contactPerson}</p></div>}
               {data.accommodation.contactNumber && <div><p className="text-xs text-gray-500">Contact Number</p><p className="text-sm font-medium">{data.accommodation.contactNumber}</p></div>}
               {data.accommodation.address && <div className="sm:col-span-2"><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium">{data.accommodation.address}</p></div>}
            </div>

            {/* Accommodation Proof Document */}
            {data.accommodation.proofDocument && (
              <div className="pt-3 border-t border-gray-100">
                 <h5 className="text-xs font-medium mb-2 text-gray-600">Proof of Accommodation Document</h5>
                 <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                   {/* Doc Info */}
                   <div className="flex-grow">
                     <p className="text-sm font-medium capitalize">{data.accommodation.proofDocument.type?.replace(/_/g, ' ') || 'Document'}</p>
                     {data.accommodation.proofDocument.fileName && <p className="text-xs text-gray-500 font-mono">{data.accommodation.proofDocument.fileName}</p>}
                     {data.accommodation.proofDocument.uploadedAt && <p className="text-xs text-gray-500" suppressHydrationWarning> Uploaded: {formatDate(data.accommodation.proofDocument.uploadedAt)}</p>}
                     {data.accommodation.proofDocument.verifiedAt && <p className="text-xs text-gray-500" suppressHydrationWarning> Verified: {formatDate(data.accommodation.proofDocument.verifiedAt)}</p>}
                   </div>
                    {/* Status & Action */}
                   <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                     {data.accommodation.proofDocument.verificationStatus && (
                       <Badge variant="outline" className={`text-xs ${
                           data.accommodation.proofDocument.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
                           data.accommodation.proofDocument.verificationStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                           'bg-amber-100 text-amber-800 border-amber-200' // Default to pending/amber
                         }`}>
                         {data.accommodation.proofDocument.verificationStatus.charAt(0).toUpperCase() + data.accommodation.proofDocument.verificationStatus.slice(1)}
                       </Badge>
                     )}
                     {data.accommodation.proofDocument.fileUrl && (
                       <Button variant="outline" size="sm" className="h-8" asChild>
                         <a href={data.accommodation.proofDocument.fileUrl} target="_blank" rel="noopener noreferrer">
                           <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                         </a>
                       </Button>
                     )}
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional: Add Travel History Section if data is available */}
      {data.travelHistory && data.travelHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Previous Travel History</h4>
            <div className="space-y-2">
               {data.travelHistory.map((trip: any, index: number) => (
                  <div key={index} className="p-3 bg-white rounded-md border border-gray-200 text-sm">
                     <div className="flex justify-between items-start gap-2">
                        <div>
                           <p className="font-medium">{trip.destinationCountry} ({trip.destinationCity || 'N/A'})</p>
                           <p className="text-xs text-gray-600">{trip.purpose || 'N/A'}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500 flex-shrink-0">
                           <p suppressHydrationWarning>{formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}</p>
                           <p>{trip.durationDays} days</p>
                        </div>
                     </div>
                     {/* Add visa type if available */}
                     {trip.visaType && <p className="text-xs mt-1 pt-1 border-t border-gray-100">Visa: {trip.visaType}</p>}
                  </div>
               ))}
            </div>
          </div>
       )}

       {/* Optional: Add Travel Insurance Section if data is available */}
       {data.travelInsurance && (
           <div>
              <h4 className="text-sm font-medium mb-2">Travel Insurance</h4>
              <div className="p-3 bg-white rounded-md border border-gray-200">
                 {/* Insurance details */}
                 {/* Add document view if applicable */}
              </div>
           </div>
        )}

    </div>
  );
}