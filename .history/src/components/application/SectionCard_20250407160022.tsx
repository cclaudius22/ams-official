// src/components/application/SectionCard.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, MessageCircle, AlertTriangle } from 'lucide-react'
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

  const renderCardContent = () => {
    const { data } = section;
    
    // Render different content based on section type
    switch (data.sectionId) {
      case 'passport':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{data.surname}, {data.givenNames}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium">{data.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passport Number</p>
                <p className="font-medium">{data.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(data.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{formatDate(data.dateOfExpiry)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Issuing Country</p>
              <p className="font-medium">{data.issuingCountry}</p>
            </div>
          </>
        );
      
      // Add other section types here...
      
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p>No detailed information available for this section</p>
          </div>
        );
    }
  };

  return (
    <Card className={`mb-4 ${hasCriticalIssues ? 'border-red-300' : hasWarningIssues ? 'border-amber-300' : ''}`}>
      <CardHeader className={`${hasCriticalIssues ? 'bg-red-50' : hasWarningIssues ? 'bg-amber-50' : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {section.validationStatus === 'success' && (
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            )}
            {section.validationStatus === 'pending' && (
              <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
            )}
            {section.validationStatus === 'error' && (
              <Badge className="bg-red-100 text-red-800">Error</Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Less details' : 'More details'}
            </Button>
          </div>
        </div>
        {scanIssues.length > 0 && (
          <div className="mt-2">
            {scanIssues.map((issue, index) => (
              <Alert 
                key={index} 
                variant={
                  issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 
                  issue.severity === 'medium' ? 'default' : 'outline'
                }
                className={`
                  mb-2 py-2 
                  ${issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 
                    issue.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
                    'bg-blue-50 border-blue-200 text-blue-800'}
                `}
              >
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <AlertTitle className="text-sm font-medium">{issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue</AlertTitle>
                    <AlertDescription className="text-xs">{issue.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-4">
          {renderCardContent()}
        </CardContent>
      )}
      
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddNote}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Add Note
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefer}
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Refer
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onApprove}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}