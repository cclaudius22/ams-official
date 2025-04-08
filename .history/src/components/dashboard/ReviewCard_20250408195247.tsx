// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ExternalLink, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types - ideally should match your application review type
interface Review {
  id: string;
  applicant: string;
  riskScore: number;
  slaRemaining: string;
  aiRecommendation: string;
  priority: 'high' | 'medium' | 'low';
  flags: string[];
  team: {
    background: string;
    identity: string;
    document: string;
  };
  lastUpdated: string;
  documents: string[];
  type: string;
  country: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const router = useRouter();
  
  // Function to get color based on risk score
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };
  
  // Function to get color based on priority
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };
  
  // Function to format ID for URL
  const getIdForUrl = (id: string) => id.startsWith('#') ? id.substring(1) : id;
  
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: ID and Applicant */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-500">{review.id}</span>
                {review.priority === 'high' && (
                  <Badge variant="outline" className={cn("px-2 py-0.5 text-xs", getPriorityColor(review.priority))}>
                    High Priority
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1">{review.applicant}</h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">{review.type}</span>
                <span>•</span>
                <span className="text-gray-500">{review.country}</span>
              </div>
            </div>
            
            {/* Center: Risk/SLA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col items-center">
                <div className={cn("text-sm font-medium px-3 py-1 rounded-full", getRiskColor(review.riskScore))}>
                  Risk: {review.riskScore}/100
                </div>
                {review.slaRemaining !== 'N/A' && (
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    SLA: {review.slaRemaining}
                  </div>
                )}
              </div>
              
              {/* AI Recommendation */}
              <div>
                <div className="text-sm font-medium text-gray-500">AI Recommendation</div>
                <div className="text-sm font-semibold">{review.aiRecommendation}</div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="mt-4 sm:mt-0">
              <Link href={`/dashboard/reviewer/${getIdForUrl(review.id)}`} passHref>
                <Button variant="default">
                  Review <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Review Team Information */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Team:</span>
                <span>Background: {review.team.background}</span>
                <span>•</span> 
                <span>Identity: {review.team.identity}</span>
                <span>•</span>
                <span>Document: {review.team.document}</span>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {review.lastUpdated}
              </div>
            </div>
          </div>
          
          {/* Flags Section */}
          {review.flags && review.flags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {review.flags.map((flag, index) => (
                <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {flag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;