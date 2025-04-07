// src/components/application/ApplicationHeader.tsx
import React from 'react';
import { ApplicationData } from '@/types/application';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Added Mail, Phone, CheckCircle, AlertCircle for verification status
import { FileText, User, Clock, Eye, Download, Mail, Phone, CheckCircle, AlertCircle, HelpCircle, Loader, XCircle } from 'lucide-react'; // Added more icons for status
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface ApplicationHeaderProps {
  application: ApplicationData;
}

// Helper function to format application status (moved outside for clarity)
const getStatusProps = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
        case 'approved': case 'completed':
            return { text: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        case 'rejected': case 'failed':
             return { text: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle };
        case 'referred': case 'review_required':
             return { text: 'Review Required', color: 'bg-amber-100 text-amber-800', icon: AlertCircle };
        case 'draft':
             return { text: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText };
        case 'submitted': case 'processing':
             return { text: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Loader };
        default:
            return { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800', icon: HelpCircle };
    }
};


export default function ApplicationHeader({ application }: ApplicationHeaderProps) {
  // Handle case where application data might not be loaded yet
  if (!application) {
     return <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-pulse">Loading header...</div>;
  }

  // Format date for display
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    } catch (e) {
        return 'Error Date';
    }
  };

  // --- Get Applicant Name STRICTLY from Passport Section ---
  const passportData = application.sections?.passport?.data;
  const applicantName = passportData
    ? `${passportData.givenNames || ''} ${passportData.surname || ''}`.trim() || 'Applicant Name Missing' // Handle empty names
    : 'Passport Data Missing'; // Fallback if passport section/data is missing
  // --- End Get Applicant Name ---

  // --- Get contact details (assuming they might be in applicantDetails or root) ---
  // !! IMPORTANT: Adjust these paths if your actual data structure differs !!
  const email = application.applicantDetails?.email || application.email; // Example fallback
  const emailVerified = application.applicantDetails?.emailVerified ?? application.emailVerified; // Example fallback
  const phoneNumber = application.applicantDetails?.phoneNumber || application.phoneNumber; // Example fallback
  const phoneVerified = application.applicantDetails?.phoneVerified ?? application.phoneVerified; // Example fallback
  // --- End Get contact details ---

  // Format Visa Type Title
  const visaTitle = application.visaTypeId?.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Visa Application';

  // Format Processing Type Badge
  const processingTypeDisplay = application.processingType?.charAt(0).toUpperCase() + application.processingType?.slice(1) || 'Standard';

  // Get Status Props
  const statusProps = getStatusProps(application.status);
  const StatusIcon = statusProps.icon;


  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-200">
      {/* Top Row: Title, Status, Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        {/* Left: Title and Processing Badge */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{visaTitle}</h1>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">
            {processingTypeDisplay} Path
          </Badge>
           {/* Status Badge */}
          <Badge className={cn("text-xs px-2.5 py-1", statusProps.color)}>
               <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
               {statusProps.text}
          </Badge>
        </div>
         {/* Right: Action Buttons */}
        <div className="flex space-x-2 flex-shrink-0 self-end md:self-center">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
            <Eye className="h-4 w-4 mr-1.5" />
            View as Applicant
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Bottom Row: Details (ID, Name, Submitted, Contact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm">
          {/* Column 1: ID and Name */}
          <div className="space-y-2">
             <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 mr-1">ID:</span>
                <span className="font-mono text-gray-800">{application.applicationId || 'N/A'}</span>
             </div>
             <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                 <span className="text-xs text-gray-500 mr-1">Applicant:</span>
                {/* Name now strictly from passport */}
                <span className="font-medium text-gray-800">{applicantName}</span>
             </div>
          </div>

          {/* Column 2: Submitted Date & Contact Email */}
          <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                 <span className="text-xs text-gray-500 mr-1">Submitted:</span>
                 {/* Use optional chaining and check path */}
                <span suppressHydrationWarning>{formatDate(application.progress?.lastUpdated || application.createdAt)}</span>
             </div>
             {/* Contact Email */}
             {email && (
                <div className="flex items-center text-gray-600 group">
                    <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 mr-1">Email:</span>
                    <a href={`mailto:${email}`} className="hover:text-blue-600 hover:underline truncate" title={email}>{email}</a>
                    {/* Verification Badge */}
                    {emailVerified !== undefined && (
                       <Badge variant="outline" className={cn(
                           "ml-2 px-1 py-0 text-[10px] h-4 border",
                           emailVerified ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
                       )}>
                          {emailVerified ? <CheckCircle className="h-2.5 w-2.5 mr-0.5"/> : <AlertCircle className="h-2.5 w-2.5 mr-0.5"/>}
                          {emailVerified ? 'Verified' : 'Unverified'}
                       </Badge>
                     )}
                </div>
             )}
          </div>

           {/* Column 3: Contact Phone */}
           <div className="space-y-2">
              {phoneNumber && (
                 <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                     <span className="text-xs text-gray-500 mr-1">Phone:</span>
                    <span>{phoneNumber}</span>
                    {/* Verification Badge */}
                     {phoneVerified !== undefined && (
                       <Badge variant="outline" className={cn(
                           "ml-2 px-1 py-0 text-[10px] h-4 border",
                           phoneVerified ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
                       )}>
                          {phoneVerified ? <CheckCircle className="h-2.5 w-2.5 mr-0.5"/> : <AlertCircle className="h-2.5 w-2.5 mr-0.5"/>}
                          {phoneVerified ? 'Verified' : 'Unverified'}
                       </Badge>
                     )}
                 </div>
              )}
           </div>
      </div>
    </div>
  );
}