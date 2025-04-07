'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, AlertCircle, MessageCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
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
          <div className="space-y-3">
            <div className="flex">
              <div className="w-1/3">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{data.surname}, {data.givenNames}</p>
              </div>
              <div className="w-1/3">
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium">{data.nationality}</p>
              </div>
              <div className="w-1/3">
                <p className="text-sm text-gray-500">Passport Number</p>
                <p className="font-medium">{data.documentNumber}</p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex">
              <div className="w-1/3">
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(data.dateOfBirth)}</p>
              </div>
              <div className="w-1/3">
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender}</p>
              </div>
              <div className="w-1/3">
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{formatDate(data.dateOfExpiry)}</p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Issuing Country</p>
              <p className="font-medium">{data.issuingCountry}</p>
            </div>
          </div>
        );
      
      // Add other section types here as needed...
      
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