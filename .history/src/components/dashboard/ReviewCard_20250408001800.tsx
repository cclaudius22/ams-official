// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Use shadcn Badge
import { Button } from '@/components/ui/button'; // Use shadcn Button
import { Shield, Fingerprint, UserCheck, FileText, Download, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react'; // Import needed icons

// Reuse the type (consider moving types to a shared location if used elsewhere)
interface ApplicationReview {
  id: string;
  applicant: string;
  riskScore: number;
  slaRemaining: string;
  aiRecommendation: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'completed' | 'escalated'; // Status might not be needed if filtered by tab
  flags: string[];
  team: {
    background: string;
    identity: string;
    document: string;
  };
  lastUpdated: string; // Could be Date object
  documents: string[]; // Maybe more structured later {name: string, url?: string}
  type: string;
  country: string;
}

interface ReviewCardProps {
  review: ApplicationReview;
  // Add callbacks for actions if needed directly on the card later
  // onEscalate: (id: string) => void;
  // onRequestDocs: (id: string) => void;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    // Prepare application ID for the URL (remove leading '#' if present)
    const appIdForUrl = review.id.startsWith('#') ? review.id.substring(1) : review.id;

    // Determine Risk display
    const riskDisplay = review.riskScore > 70 ? { text: 'High', color: 'text-red-600' } :
                        review.riskScore > 40 ? { text: 'Medium', color: 'text-orange-600' } :
                        { text: 'Low', color: 'text-green-600' };

    // Determine Priority border color
    const priorityBorder = review.priority === 'high' ? 'border-l-red-500' :
                           review.priority === 'medium' ? 'border-l-orange-500' :
                           'border-l-blue-500';

     // Determine Priority badge color
     const priorityBadge = review.priority === 'high' ? 'bg-red-100 text-red-800' :
                           review.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                           'bg-blue-100 text-blue-800';

     // Determine SLA color
     const slaColor = review.slaRemaining.includes('h') && parseInt(review.slaRemaining) <= 4 ? 'text-orange-600' : 'text-green-600';

  return (
    <Card className={`mb-4 border shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${priorityBorder}`}>
      <CardContent className="p-4 md:p-6">
        {/* Top Row: ID, Priority, Flags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h3 className="font-semibold text-lg text-gray-800 mr-2">{review.id}</h3>
          <Badge variant="secondary" className={priorityBadge}>
            {review.priority.charAt(0).toUpperCase() + review.priority.slice(1)} Priority
          </Badge>
          {review.flags.map((flag, index) => (
            <Badge key={index} variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800">
               <AlertTriangle className="h-3 w-3 mr-1"/> {flag}
            </Badge>
          ))}
        </div>

        {/* Grid: Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 mb-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Applicant</p>
            <p className="font-medium truncate" title={review.applicant}>{review.applicant}</p>
            <p className="text-xs text-gray-500">{review.type} • {review.country}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Risk Score</p>
            <p className={`font-medium ${riskDisplay.color}`}>
              {riskDisplay.text} ({review.riskScore}/100)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">SLA Remaining</p>
            <p className={`font-medium ${slaColor}`}>{review.slaRemaining}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">AI Recommendation</p>
            <p className="font-medium">{review.aiRecommendation}</p>
          </div>
        </div>

        {/* Team Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <h4 className="text-xs font-medium text-gray-600">Review Team Assigned</h4>
            <p className="text-xs text-gray-400">Last updated {review.lastUpdated}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
              <span>Background: <span className="font-medium">{review.team.background}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <Fingerprint className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
              <span>Identity: <span className="font-medium">{review.team.identity}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span>Document: <span className="font-medium">{review.team.document}</span></span>
            </div>
          </div>
        </div>

        {/* Documents Summary & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Document List */}
             <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm">
               <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
               <span className="text-xs text-gray-600 mr-1">Docs:</span>
               {review.documents.slice(0, 3).map((doc, index) => ( // Show first 3
                 <span key={index} className="text-gray-700 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                   {doc}
                 </span>
               ))}
               {review.documents.length > 3 && <span className="text-xs text-gray-500">+{review.documents.length - 3} more</span>}
             </div>

           {/* Action Buttons */}
            <div className="flex space-x-2 self-end sm:self-center flex-shrink-0">
             {/* Add onClick handlers later for these */}
              <Button variant="outline" size="sm">
                 <Download className="h-3.5 w-3.5 mr-1.5" /> Download Docs
              </Button>
              {/* <Button variant="outline" size="sm">Request Docs</Button> */}
              {/* <Button variant="destructive" size="sm">Escalate</Button> */}

              {/* Navigation Link Button */}
              <Link href={`/dashboard/reviewer/${appIdForUrl}`} passHref>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                     <Eye className="h-3.5 w-3.5 mr-1.5" /> Start Review
                </Button>
              </Link>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}