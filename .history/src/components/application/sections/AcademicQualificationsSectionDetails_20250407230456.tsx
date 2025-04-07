// components/application/sections/AcademicQualificationsSectionDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, GraduationCap, CheckCircle } from 'lucide-react'; // Import icons
import { formatDate } from '@/utils/formatters'; // Assuming date formatter
import { cn } from '@/lib/utils';

interface AcademicQualificationsSectionDetailsProps {
  data: any; // Ideally: AcademicQualificationsData type with qualifications array
}

// Helper component for individual qualification item
const QualificationItem: React.FC<{ qualification: any }> = ({ qualification }) => {
    const doc = qualification.document;

    return (
        <div className="p-4 bg-white rounded-md border border-gray-200 space-y-3">
            {/* Top Row: Name, Institution, Year */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                 <div className="flex-grow">
                     <p className="text-sm font-medium flex items-center gap-1.5">
                         <GraduationCap className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                         {qualification.name || 'Qualification Name N/A'}
                     </p>
                     <p className="text-sm text-gray-700 pl-6">{qualification.institution || 'Institution N/A'}{qualification.country ? `, ${qualification.country}`: ''}</p>
                 </div>
                 {qualification.yearCompleted && (
                    <p className="text-sm font-semibold text-gray-800 flex-shrink-0 self-start sm:self-center pt-1 sm:pt-0">
                       {qualification.yearCompleted}
                    </p>
                  )}
            </div>

             {/* Middle Row: Level, Grade, Specialization */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs pl-6">
                 {qualification.level && <div><span className="text-gray-500">Level:</span> {qualification.level}</div>}
                 {qualification.gradeOrResult && <div><span className="text-gray-500">Grade/Result:</span> {qualification.gradeOrResult}</div>}
                 {qualification.specialization && <div><span className="text-gray-500">Specialization:</span> {qualification.specialization}</div>}
             </div>

            {/* Document Row */}
            {doc && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t border-gray-100">
                    {/* Doc Info */}
                    <div className="text-xs text-gray-500">
                         <p className="capitalize font-medium text-gray-600">{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
                         {doc.fileName && <p className="font-mono">{doc.fileName}</p>}
                         {doc.uploadedAt && <p suppressHydrationWarning>Uploaded: {formatDate(doc.uploadedAt)}</p>}
                    </div>
                     {/* Status & Action */}
                    <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                        {doc.verificationStatus && (
                            <Badge variant="outline" className={cn(`text-xs`,
                                doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                            )}>
                                {doc.verificationStatus === 'verified' ? <CheckCircle className="h-3 w-3 mr-1"/> : null }
                                {doc.verificationStatus.charAt(0).toUpperCase() + doc.verificationStatus.slice(1)}
                            </Badge>
                        )}
                        {doc.fileUrl && (
                            <Button variant="outline" size="sm" className="h-8" asChild>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"> <Eye className="h-3.5 w-3.5 mr-1.5" /> View Doc </a>
                            </Button>
                        )}
                    </div>
                </div>
             )}
        </div>
    );
};


export default function AcademicQualificationsSectionDetails({ data }: AcademicQualificationsSectionDetailsProps) {
  // Handle cases where data or the qualifications list might be missing
  if (!data || !data.qualifications || data.qualifications.length === 0) {
    return <div className="p-4 text-center text-gray-500">No academic qualifications provided.</div>;
  }

  return (
    <div className="space-y-3">
       <h4 className="text-sm font-medium mb-1">Academic Qualifications</h4>
       {data.qualifications.map((qual: any, index: number) => (
          <QualificationItem key={index} qualification={qual} />
       ))}
       {/* Optionally, add overall section completion timestamp if available */}
       {data.completedAt && (
           <p className="text-xs text-gray-500 text-right mt-4" suppressHydrationWarning>
              Section Last Updated: {new Date(data.completedAt).toLocaleString('en-GB')}
           </p>
        )}
    </div>
  );
}