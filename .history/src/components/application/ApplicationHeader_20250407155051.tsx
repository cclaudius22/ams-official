// src/components/application/ApplicationHeader.tsx
import React from 'react'
import { ApplicationData } from '@/types/application'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, User, Clock, Eye, Download } from 'lucide-react'

interface ApplicationHeaderProps {
  application: ApplicationData;
}

export default function ApplicationHeader({ application }: ApplicationHeaderProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Extract applicant name from passport data if available
  const applicantName = application.sections.passport?.data ? 
    `${application.sections.passport.data.givenNames} ${application.sections.passport.data.surname}` :
    'Applicant';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold">{application.visaTypeId.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')} Visa</h1>
            <Badge className="bg-blue-100 text-blue-800">
              {application.processingType.charAt(0).toUpperCase() + application.processingType.slice(1)} Path
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>{application.applicationId}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{applicantName}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Submitted: {formatDate(application.progress.lastUpdated)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="text-blue-600">
            <Eye className="h-4 w-4 mr-2" />
            View as Applicant
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}