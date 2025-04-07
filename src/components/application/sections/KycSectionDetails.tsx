// components/application/sections/KycSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Import cn for conditional classes

// Define specific props - Replace 'any' with a defined KycData type if you have one
interface KycSectionDetailsProps {
  data: any; // Ideally: KycData type
}

export default function KycSectionDetails({ data }: KycSectionDetailsProps) {
  // Handle cases where data might be missing entirely
  if (!data) {
    return <div className="p-4 text-center text-gray-500">No KYC data provided.</div>;
  }

  // Helper function to determine progress bar color based on score
  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return 'bg-gray-300'; // Grey for N/A scores
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row">
        {/* Selfie Photo */}
        <div className="w-full md:w-1/3 pr-0 md:pr-4 mb-4 md:mb-0">
          <p className="text-sm text-gray-500 mb-2">Verified Selfie</p>
          <div className="border rounded-md overflow-hidden mb-2 max-w-[200px] mx-auto md:mx-0">
            <img
              src={data.selfieImageUrl || 'https://placehold.co/200x200/png?text=No+Selfie'}
              alt="Verified Selfie"
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Optional: Add verification status for the selfie itself if available */}
          {/* <p className="text-xs text-center text-gray-500">Selfie Quality: {data.selfieQuality || 'N/A'}</p> */}
        </div>

        {/* KYC Details */}
        <div className="w-full md:w-2/3 space-y-4"> {/* Increased spacing */}
          {/* Facematch Score */}
          <div>
            <p className="text-sm text-gray-500">Facematch Score</p>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-gray-200 rounded-full w-full mr-2 overflow-hidden">
                <div
                  className={cn('h-2 rounded-full', getScoreColor(data.facematchScore))}
                  style={{ width: `${data.facematchScore ?? 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium w-10 text-right">{data.facematchScore != null ? `${data.facematchScore}%` : 'N/A'}</span>
            </div>
          </div>

          {/* Liveness Score */}
          <div>
            <p className="text-sm text-gray-500">Liveness Score</p>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-gray-200 rounded-full w-full mr-2 overflow-hidden">
                <div
                  className={cn('h-2 rounded-full', getScoreColor(data.livenessScore))}
                  style={{ width: `${data.livenessScore ?? 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium w-10 text-right">{data.livenessScore != null ? `${data.livenessScore}%` : 'N/A'}</span>
            </div>
          </div>

          {/* Liveness Checks */}
          {data.livenessChecks?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Liveness Checks Passed</p>
              <div className="flex flex-wrap gap-1.5 mt-1"> {/* Increased gap */}
                {data.livenessChecks.map((check: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs capitalize font-normal px-1.5 py-0.5"> {/* Adjusted padding/font */}
                    {check.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Completed At */}
          {data.completedAt && (
            <div>
              <p className="text-sm text-gray-500">Verification Completed</p>
              <p className="font-medium text-sm" suppressHydrationWarning>
                 {new Date(data.completedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          )}

          {/* Device Information */}
          {data.metadataCapture && (
            <div>
              <p className="text-sm text-gray-500">Device Information</p>
              <div className="text-sm bg-gray-100 border border-gray-200 rounded p-2 text-xs space-y-0.5"> {/* Added background/border */}
                 {data.metadataCapture.deviceModel && <p>Device: <span className="font-mono">{data.metadataCapture.deviceModel}</span></p>}
                 {data.metadataCapture.os && <p>OS: <span className="font-mono">{data.metadataCapture.os}</span></p>}
                 {data.metadataCapture.browser && <p>Browser: <span className="font-mono">{data.metadataCapture.browser}</span></p>}
                 {data.metadataCapture.ipAddress && <p>IP Address: <span className="font-mono">{data.metadataCapture.ipAddress}</span></p>}
                 {data.metadataCapture.location && (
                    <p>Approx. Location: <span className="font-mono">{data.metadataCapture.location.latitude?.toFixed(4)}, {data.metadataCapture.location.longitude?.toFixed(4)}</span></p>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}