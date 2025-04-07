'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, CheckCircle2, AlertCircle, MessageCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { ApplicationSection } from '@/types/application'
import { ScanIssue } from '@/types/aiScan'

// Format a date string to a readable format using en-GB formatting.
// We add suppressHydrationWarning on the elements displaying these dates to avoid hydration mismatches.
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Helper function to calculate duration between two dates.
const calculateDuration = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  const totalMonths = (yearDiff * 12) + monthDiff
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return `${years > 0 ? years + ' yr' + (years > 1 ? 's' : '') : ''}${years > 0 && months > 0 ? ', ' : ''}${months > 0 ? months + ' month' + (months > 1 ? 's' : '') : ''}`
}

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  section: ApplicationSection
  scanIssues?: ScanIssue[]
  onApprove: () => void
  onRefer: () => void
  onAddNote: () => void
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
  const [expanded, setExpanded] = useState(false)

  // Render Passport Section
  const renderPassportSection = (data: any) => {
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
                <p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issue Date</p>
                <p className="text-sm font-medium" suppressHydrationWarning>{data.issueDate ? formatDate(data.issueDate) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiry Date</p>
                <p className="text-sm font-medium" suppressHydrationWarning>{formatDate(data.dateOfExpiry)}</p>
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
              <p className="text-sm" suppressHydrationWarning>{data.scanDate ? new Date(data.scanDate).toLocaleString() : 'N/A'}</p>
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
    )
  }

  // Render KYC Section
  const renderKycSection = (data: any) => {
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
          {/* KYC Details */}
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
                  {data.livenessChecks?.map((check: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {check.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed At</p>
                <p className="font-medium" suppressHydrationWarning>{data.completedAt ? new Date(data.completedAt).toLocaleString() : 'N/A'}</p>
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
    )
  }

  // Render Residency Section
  const renderResidencySection = (data: any) => {
    return (
      <div className="space-y-5">
        {/* Current Address */}
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
                        {data.residencyAddress.residenceDuration.years} years, {data.residencyAddress.residenceDuration.months} months
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
              data.documents.map((doc: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-sm capitalize">{doc.type.replace('_', ' ')}</h5>
                      <p className="text-xs text-gray-500">
                        {doc.issueDate ? `Issued: ${doc.issueDate}` : ''} {doc.issueDate && doc.issuer ? ' | ' : ''} {doc.issuer || ''}
                      </p>
                      {doc.addressLines && (
                        <div className="mt-1 text-sm">
                          {doc.addressLines.map((line: string, i: number) => (
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
                    <span suppressHydrationWarning>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}</span>
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
              <p className="text-sm" suppressHydrationWarning>{data.verificationTimestamp ? new Date(data.verificationTimestamp).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-2 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500">Verification Completed</p>
              <p className="text-sm" suppressHydrationWarning>{data.verificationCompletedTimestamp ? new Date(data.verificationCompletedTimestamp).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-2 bg-white rounded-md border border-gray-200 col-span-2">
              <p className="text-xs text-gray-500">Verification Method</p>
              <p className="text-sm capitalize">{data.residencyAddress?.verificationMethod?.replace('_', ' ') || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Professional Section
  const renderProfessionalSection = (data: any) => {
    return (
      <div className="space-y-5">
        {/* Current Employment Information */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Employment</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <div>
                  <h5 className="font-medium">{data.companyName}</h5>
                  <p className="text-sm text-gray-700">{data.jobRole}</p>
                  <p className="text-xs text-gray-500">
                    {data.startDate ? `Since ${new Date(data.startDate).toLocaleDateString()}` : ''} {data.yearsInRole ? ` (${data.yearsInRole} years)` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {data.annualSalary?.amount?.toLocaleString()} {data.annualSalary?.currency}
                  </p>
                  <p className="text-xs text-gray-500">Annual Salary</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Employment Type</p>
                  <p className="capitalize">{data.employmentType?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Industry</p>
                  <p>{data.industry || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p>{data.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Job Level</p>
                  <p className="capitalize">{data.jobLevel || 'N/A'}</p>
                </div>
              </div>
              {data.responsibilities && data.responsibilities.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Key Responsibilities</p>
                  <ul className="list-disc pl-4 text-sm space-y-0.5">
                    {data.responsibilities.map((resp: string, index: number) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.skills && data.skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Employer Information */}
        <div>
          <h4 className="text-sm font-medium mb-2">Employer Information</h4>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                {data.employerAddress ? (
                  <div className="text-sm">
                    <p>{data.employerAddress.line1}</p>
                    {data.employerAddress.line2 && <p>{data.employerAddress.line2}</p>}
                    <p>{data.employerAddress.city}, {data.employerAddress.postalCode}</p>
                    <p>{data.employerAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No address provided</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                {data.employerContact ? (
                  <div className="text-sm">
                    <p className="font-medium">{data.employerContact.name}</p>
                    <p className="text-gray-700">{data.employerContact.position}</p>
                    <p className="text-xs">{data.employerContact.email}</p>
                    <p className="text-xs">{data.employerContact.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No contact provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Employment Documents */}
        <div>
          <h4 className="text-sm font-medium mb-2">Supporting Documents</h4>
          <div className="grid grid-cols-1 gap-2">
            {data.employmentDocuments?.map((doc: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium capitalize">{doc.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{doc.fileName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {doc.verificationStatus && (
                    <Badge variant="outline" className={`
                      ${doc.verificationStatus === 'verified' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}
                    `}>
                      {doc.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
            {(!data.employmentDocuments || data.employmentDocuments.length === 0) && (
              <div className="p-3 text-center text-gray-500 bg-gray-50 rounded-md">
                <p>No employment documents provided</p>
              </div>
            )}
          </div>
        </div>
        {/* Previous Employment */}
        {data.previousEmployment && data.previousEmployment.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Previous Employment</h4>
            <div className="space-y-2">
              {data.previousEmployment.map((job: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{job.companyName}</p>
                      <p className="text-sm">{job.jobRole}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p suppressHydrationWarning>
                        {job.startDate ? new Date(job.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''} - 
                        {job.endDate ? new Date(job.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {calculateDuration(job.startDate, job.endDate)}
                      </p>
                    </div>
                  </div>
                  {job.reasonForLeaving && (
                    <div className="mt-1 text-xs text-gray-600">
                      <span className="text-gray-500">Reason for leaving: </span>
                      {job.reasonForLeaving}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Qualifications */}
        {data.qualifications && data.qualifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Qualifications</h4>
            <div className="space-y-2">
              {data.qualifications.map((qual: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium">{qual.name}</p>
                  <p className="text-sm">{qual.institution}</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-600">{qual.specialization}</p>
                    <p className="text-xs font-medium">{qual.yearCompleted}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Verification Information */}
        {data.verificationChecks && (
          <div>
            <h4 className="text-sm font-medium mb-2">Verification Information</h4>
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-1.5 ${data.verificationChecks.employmentVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Employment</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-1.5 ${data.verificationChecks.salaryVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Salary</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-1.5 ${data.verificationChecks.roleVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Role</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Verification method: <span className="capitalize">{data.verificationChecks.verificationMethod?.replace(/_/g, ' ') || 'N/A'}</span>
              </p>
              <p className="text-xs text-gray-500">
                Verified on: <span suppressHydrationWarning>{data.verificationChecks.verificationDate ? new Date(data.verificationChecks.verificationDate).toLocaleString() : 'N/A'}</span>
              </p>
              {data.verificationChecks.verificationNotes && (
                <div className="mt-2 text-xs p-2 bg-blue-50 rounded border border-blue-100">
                  {data.verificationChecks.verificationNotes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Decide which section to render based on section.data.sectionId
  const renderCardContent = () => {
    const { data } = section
    switch (data.sectionId) {
      case 'passport':
        return renderPassportSection(data)
      case 'kyc':
        return renderKycSection(data)
      case 'residency':
        return renderResidencySection(data)
      case 'professional':
        return renderProfessionalSection(data)
      default:
        return (
          <div className="py-4 text-gray-500">
            <p>No detailed information available for this section</p>
          </div>
        )
    }
  }

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
  )
}
