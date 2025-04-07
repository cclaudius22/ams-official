'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Eye
} from 'lucide-react'
import { ApplicationSection } from '@/types/application'
import { ScanIssue } from '@/types/aiScan'

// Format a date string to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  section: ApplicationSection;
  scanIssues?: ScanIssue[];
  onApprove: () => void;
  onRefer: () => void;
  onAddNote: () => void;
}

export default function SectionCard({
  title,
  icon,
  section,
  scanIssues = [],
  onApprove,
  onRefer,
  onAddNote
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasCriticalIssues = scanIssues.some(issue => issue.severity === 'critical' || issue.severity === 'high');
  const hasWarningIssues = scanIssues.some(issue => issue.severity === 'medium');

 // Simplified passport render function for SectionCard
const renderPassportSection = (data) => {
    return (
      <div className="space-y-5">
        <div className="flex">
          {/* Passport Photo */}
          <div className="w-1/3 pr-5">
            <p className="text-sm text-gray-500 mb-2">Passport Photo</p>
            <div className="border rounded-md overflow-hidden mb-2">
              <img 
                src={data.passportPhotoUrl || 'https://placehold.co/400x500/png?text=No+Photo'}
                alt="Passport Photo"
                className="w-full h-auto"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Scan Quality: {data.scanQuality || 'N/A'}</span>
              <span>Score: {data.verificationScore || 'N/A'}</span>
            </div>
          </div>
          
          {/* Passport Details */}
          <div className="w-2/3">
            <h4 className="text-sm font-medium mb-2">Passport Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{data.surname}, {data.givenNames}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nationality</p>
                <p className="text-sm font-medium">{data.nationality}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Passport Number</p>
                <p className="text-sm font-medium">{data.documentNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Document Type</p>
                <p className="text-sm font-medium">{data.documentType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium">{formatDate(data.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issue Date</p>
                <p className="text-sm font-medium">{data.issueDate ? formatDate(data.issueDate) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiry Date</p>
                <p className="text-sm font-medium">{formatDate(data.dateOfExpiry)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issuing Country</p>
                <p className="text-sm font-medium">{data.issuingCountry}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Place of Issue</p>
                <p className="text-sm font-medium">{data.placeOfIssue || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* MRZ Data Section */}
        <div>
          <h4 className="text-sm font-medium mb-2">Machine Readable Zone (MRZ)</h4>
          {data.mrzData ? (
            <>
              <div className="bg-gray-100 p-2 font-mono text-sm rounded border border-gray-200 break-all mb-3">
                <div>{data.mrzData.line1}</div>
                <div>{data.mrzData.line2}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm">{data.mrzData.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm">{data.mrzData.country}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Number</p>
                  <p className="text-sm">{data.mrzData.number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nationality</p>
                  <p className="text-sm">{data.mrzData.nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">DOB</p>
                  <p className="text-sm">{data.mrzData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sex</p>
                  <p className="text-sm">{data.mrzData.sex}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expiry</p>
                  <p className="text-sm">{data.mrzData.expiryDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Personal No.</p>
                  <p className="text-sm">{data.mrzData.personalNumber || 'N/A'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-2 text-center text-gray-500">
              <p>No MRZ data available</p>
            </div>
          )}
        </div>
        
        {/* Verification Information */}
        <div>
          <h4 className="text-sm font-medium mb-2">Verification Information</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Scan Method</p>
              <p className="text-sm">{data.scanMethod || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Scan Date</p>
              <p className="text-sm">{data.scanDate ? new Date(data.scanDate).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Verification Score</p>
              <p className="text-sm">{data.verificationScore || 'N/A'}</p>
            </div>
          </div>
          {data.verificationNotes && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">Verification Notes</p>
              <p className="text-sm">{data.verificationNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the KYC section
  const renderKycSection = (data) => {
    return (
      <div className="space-y-4">
        <div className="flex">
          {/* Selfie Photo */}
          <div className="w-1/3 pr-4">
            <p className="text-sm text-gray-500 mb-2">Verified Selfie</p>
            <div className="border rounded-md overflow-hidden mb-2">
              <img 
                src={data.selfieImageUrl || 'https://placehold.co/400x400/png?text=No+Selfie'}
                alt="Verified Selfie"
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* KYC Verification Details */}
          <div className="w-2/3">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Facematch Score</p>
                <div className="flex items-center">
                  <div className="h-2 bg-gray-200 rounded-full w-full">
                    <div 
                      className={`h-2 rounded-full ${data.facematchScore >= 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${data.facematchScore}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{data.facematchScore}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Liveness Score</p>
                <div className="flex items-center">
                  <div className="h-2 bg-gray-200 rounded-full w-full">
                    <div 
                      className={`h-2 rounded-full ${data.livenessScore >= 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${data.livenessScore}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{data.livenessScore}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Liveness Checks</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.livenessChecks?.map((check, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {check.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Completed At</p>
                <p className="font-medium">{data.completedAt ? new Date(data.completedAt).toLocaleString() : 'N/A'}</p>
              </div>
              
              {data.metadataCapture && (
                <div>
                  <p className="text-sm text-gray-500">Device Information</p>
                  <div className="text-sm">
                    <p>Device: {data.metadataCapture.deviceModel}</p>
                    {data.metadataCapture.location && (
                      <p>Location: {data.metadataCapture.location.latitude.toFixed(4)}, {data.metadataCapture.location.longitude.toFixed(4)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Residency section render function for SectionCard
const renderResidencySection = (data) => {
    return (
      <div className="space-y-5">
        {/* Current Address Information */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Address</h4>
          <div className="p-3 bg-white rounded-md border border-gray-200">
            {data.residencyAddress ? (
              <div>
                <p className="text-sm">{data.residencyAddress.line1}</p>
                {data.residencyAddress.line2 && <p className="text-sm">{data.residencyAddress.line2}</p>}
                <p className="text-sm">{data.residencyAddress.city}, {data.residencyAddress.postalCode}</p>
                <p className="text-sm">{data.residencyAddress.country}</p>
                
                <div className="flex mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500">
                  <div className="mr-4">
                    <span className="text-xs">Country Code: </span>
                    <span>{data.residencyAddress.countryCode}</span>
                  </div>
                  {data.residencyAddress.residenceDuration && (
                    <div>
                      <span className="text-xs">Duration: </span>
                      <span>
                        {data.residencyAddress.residenceDuration.years} years, 
                        {data.residencyAddress.residenceDuration.months} months
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2 text-center text-gray-500">
                <p>No address information available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Supporting Documents */}
        <div>
          <h4 className="text-sm font-medium mb-2">Supporting Documents</h4>
          <div className="space-y-3">
            {data.documents?.length > 0 ? (
              data.documents.map((doc, index) => (
                <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-sm capitalize">{doc.type.replace('_', ' ')}</h5>
                      <p className="text-xs text-gray-500">
                        {doc.issueDate ? `Issued: ${doc.issueDate}` : ''} 
                        {doc.issueDate && doc.issuer ? ' | ' : ''} 
                        {doc.issuer || ''}
                      </p>
                      
                      {doc.addressLines && (
                        <div className="mt-1 text-sm">
                          {doc.addressLines.map((line, i) => (
                            <p key={i} className="text-gray-600">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" className="h-8">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>Filename: {doc.fileName}</span>
                    <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500 bg-gray-50 rounded-md">
                <p>No supporting documents provided</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Verification Information */}
        <div>
          <h4 className="text-sm font-medium mb-2">Verification Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500">Verification Started</p>
              <p className="text-sm">
                {data.verificationTimestamp ? new Date(data.verificationTimestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="p-2 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500">Verification Completed</p>
              <p className="text-sm">
                {data.verificationCompletedTimestamp ? new Date(data.verificationCompletedTimestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="p-2 bg-white rounded-md border border-gray-200 col-span-2">
              <p className="text-xs text-gray-500">Verification Method</p>
              <p className="text-sm capitalize">{data.residencyAddress?.verificationMethod?.replace('_', ' ') || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCardContent = () => {
    const { data } = section;
    
    // Render different content based on section type
    switch (data.sectionId) {
      case 'passport':
        return renderPassportSection(data);
      
      case 'kyc':
        return renderKycSection(data);

    case 'residency':
      return renderResidencySection(data);
    
      
      // Add other section types as needed...
      
      default:
        return (
          <div className="py-4 text-gray-500">
            <p>No detailed information available for this section</p>
          </div>
        );
    }
  };

  return (
    <Card className="mb-4 border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-gray-400">{icon}</div>
            <CardTitle className="text-base font-medium text-gray-700">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {section.validationStatus === 'success' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">Verified</Badge>
            )}
            {section.validationStatus === 'pending' && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">Pending</Badge>
            )}
            {section.validationStatus === 'error' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100">Error</Badge>
            )}
          </div>
        </div>
        
        {scanIssues.length > 0 && (
          <div className="mt-2">
            {scanIssues.map((issue, index) => (
              <div 
                key={index}
                className={`
                  mt-2 p-2 text-sm rounded-md border
                  ${issue.severity === 'critical' || issue.severity === 'high' ? 'border-red-200 bg-red-50 text-red-800' : 
                    issue.severity === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-800' : 
                    'border-blue-200 bg-blue-50 text-blue-800'}
                `}
              >
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}</p>
                    <p className="text-xs mt-0.5">{issue.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-gray-500 hover:text-gray-700 w-full justify-between"
        >
          <span>{expanded ? 'Hide details' : 'Show details'}</span>
          {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>
      </CardHeader>
      
      {expanded && (
        <>
          <Separator />
          <CardContent className="pt-4 bg-gray-50">
            {renderCardContent()}
          </CardContent>
        </>
      )}
      
      <Separator />
      <CardFooter className="py-3 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddNote}
          className="text-gray-600 border-gray-200"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Note
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefer}
          className="text-amber-600 border-amber-200"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Refer
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onApprove}
          className="text-green-600 border-green-200"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}