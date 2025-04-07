// components/application/sections/PassportSectionDetails.tsx
import React from 'react';
import { formatDate } from '@/utils/dateUtils'; // Adjust path if needed

// Define specific props - Replace 'any' with a defined PassportData type if you have one
interface PassportSectionDetailsProps {
  data: any; // Ideally: PassportData type
}

export default function PassportSectionDetails({ data }: PassportSectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No Passport data provided.</div>;
  }

  // --- This is the rendering logic moved from the old SectionCard ---
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row">
        {/* Passport Photo */}
        <div className="w-full md:w-1/3 pr-0 md:pr-5 mb-4 md:mb-0">
          <p className="text-sm text-gray-500 mb-2">Passport Photo</p>
          <div className="border rounded-md overflow-hidden mb-2 max-w-[200px] mx-auto md:mx-0">
            <img
              src={data.passportPhotoUrl || 'https://placehold.co/200x250/png?text=No+Photo'}
              alt="Passport Photo"
              className="w-full h-auto object-cover"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {/* Added null checks for MRZ fields */}
            <div><p className="text-xs text-gray-500">Type</p><p className="text-sm">{data.mrzData.type || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Country</p><p className="text-sm">{data.mrzData.country || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Number</p><p className="text-sm">{data.mrzData.number || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Nationality</p><p className="text-sm">{data.mrzData.nationality || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">DOB</p><p className="text-sm">{data.mrzData.dateOfBirth || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Sex</p><p className="text-sm">{data.mrzData.sex || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Expiry</p><p className="text-sm">{data.mrzData.expiryDate || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Personal No.</p><p className="text-sm">{data.mrzData.personalNumber || 'N/A'}</p></div>
          </div>
        </div>
      ) : (
         <div className="py-2 text-sm text-gray-500">No MRZ data available</div>
      )}

      {/* Verification Information */}
      {/* Conditionally render this section only if some verification data exists */}
      {(data.scanMethod || data.scanDate || data.verificationScore || data.verificationNotes) && (
        <div>
          <h4 className="text-sm font-medium mb-2">Verification Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-2">
            <div><p className="text-xs text-gray-500">Scan Method</p><p className="text-sm">{data.scanMethod || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Scan Date</p><p className="text-sm" suppressHydrationWarning>{data.scanDate ? new Date(data.scanDate).toLocaleString('en-GB') : 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Verification Score</p><p className="text-sm">{data.verificationScore || 'N/A'}</p></div>
          </div>
          {data.verificationNotes && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">Verification Notes</p>
              <p className="text-sm">{data.verificationNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}