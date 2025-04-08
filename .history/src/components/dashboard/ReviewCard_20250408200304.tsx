// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, ChevronRight, CheckCircle, XCircle, HelpCircle, User, Globe, FileText } from 'lucide-react'; // Added more icons
import { cn } from '@/lib/utils';

// Interface assumes 'country' field now represents Passport info
interface Review {
  id: string;
  applicant: string;
  riskScore: number; // 0-100
  slaRemaining: string; // e.g., "2h 15m", "Overdue", "N/A"
  aiRecommendation: 'Approve' | 'Reject' | 'Review'; // Specific values for easier coloring
  priority: 'high' | 'medium' | 'low';
  flags: string[];
  // Removed team for less noise, can be added back if essential
  lastUpdated: string; // e.g., "5m ago", "2023-10-27 10:30"
  type: string; // Visa Type
  passport: string; // Changed from country
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {

  const getRiskColor = (score: number): string => {
    if (score >= 75) return 'text-red-600'; // High Risk
    if (score >= 40) return 'text-orange-500'; // Medium Risk
    return 'text-green-600'; // Low Risk
  };

  const getPriorityClasses = (priority: Review['priority']): string => {
    switch (priority) {
      case 'high': return 'border-red-500 text-red-600';
      case 'medium': return 'border-orange-500 text-orange-600';
      case 'low': return 'border-green-500 text-green-600';
      default: return 'border-gray-400 text-gray-500';
    }
  };

  const getAiRecClasses = (recommendation: Review['aiRecommendation']): string => {
    switch (recommendation) {
      case 'Approve': return 'text-green-600';
      case 'Reject': return 'text-red-600';
      case 'Review': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

   const getAiRecIcon = (recommendation: Review['aiRecommendation']) => {
     switch (recommendation) {
       case 'Approve': return <CheckCircle className="h-4 w-4 mr-1" />;
       case 'Reject': return <XCircle className="h-4 w-4 mr-1" />;
       case 'Review': return <HelpCircle className="h-4 w-4 mr-1" />;
       default: return null;
     }
   };

  // Function to format ID for URL if needed
  const getIdForUrl = (id: string) => id.startsWith('#') ? id.substring(1) : id;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 overflow-hidden">
      <CardContent className="p-4">
        {/* Top Row: ID, Priority, Action Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{review.id}</span>
            {review.priority === 'high' && (
              <Badge
                variant="outline"
                className={cn("px-1.5 py-0 text-[10px] font-semibold leading-none", getPriorityClasses(review.priority))}
              >
                PRIORITY
              </Badge>
            )}
             {review.priority === 'medium' && ( // Optional: Visual for medium priority
              <Badge
                variant="outline"
                className={cn("px-1.5 py-0 text-[10px] font-semibold leading-none", getPriorityClasses(review.priority))}
              >
                MEDIUM
              </Badge>
            )}
          </div>
          <Link href={`/dashboard/reviewer/${getIdForUrl(review.id)}`} passHref>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-8 px-2">
              Review
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-6 gap-y-3">
            {/* Left Side: Applicant, Visa, Passport */}
            <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-1 flex items-center">
                   <User className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500"/>
                   {review.applicant}
                </h3>
                <div className="space-y-0.5 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                        <span>{review.type}</span>
                    </div>
                    <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                        <span>{review.passport}</span> {/* Changed label implicitly */}
                    </div>
                </div>
            </div>

            {/* Right Side: Metrics */}
            <div className="space-y-2">
                {/* Risk Score */}
                <div className="flex items-center justify-end md:justify-start">
                    <span className={cn("text-sm font-semibold", getRiskColor(review.riskScore))}>
                        Risk: {review.riskScore}/100
                    </span>
                </div>
                 {/* AI Recommendation */}
                <div className="flex items-center justify-end md:justify-start">
                     <span className={cn("text-sm font-semibold inline-flex items-center", getAiRecClasses(review.aiRecommendation))}>
                        {getAiRecIcon(review.aiRecommendation)}
                        AI: {review.aiRecommendation}
                    </span>
                </div>
                {/* SLA Remaining */}
                {review.slaRemaining !== 'N/A' && (
                    <div className="flex items-center justify-end md:justify-start text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        SLA: {review.slaRemaining}
                    </div>
                )}
            </div>
        </div>

        {/* Flags Section (If any) */}
        {review.flags && review.flags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-1.5">
            {review.flags.map((flag, index) => (
                <Badge
                    key={index}
                    variant="outline"
                    // Subtle warning badge style
                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/50 px-1.5 py-0.5 text-xs font-normal"
                >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {flag}
                </Badge>
            ))}
            </div>
        )}

        {/* Footer: Last Updated */}
        <div className="mt-3 pt-2 text-right text-xs text-gray-400 dark:text-gray-500">
             Last updated: {review.lastUpdated}
        </div>

      </CardContent>
    </Card>
  );
};

export default ReviewCard;