// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Clock, AlertTriangle, ChevronRight, CheckCircle, XCircle, HelpCircle, User, Globe, FileText, Star, CalendarDays, TrendingUp // Added icons
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components if using Shadcn

// Interface (Add submissionDate)
interface Review {
    id: string;
    applicant: string;
    riskScore: number;
    slaRemaining: string;
    aiRecommendation: 'Approve' | 'Reject' | 'Review';
    priority: 'high' | 'medium' | 'low';
    flags: string[];
    submissionDate: string; // Added
    // lastUpdated: string; // Removed for brevity, maybe add to tooltip
    type: string;
    passport: string;
}

interface ReviewCardProps {
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {

    // --- Helper Functions (Minimal adjustments needed) ---
    const getRiskColor = (score: number): string => {
        if (score >= 75) return 'text-red-500 dark:text-red-400';
        if (score >= 40) return 'text-orange-500 dark:text-orange-400';
        return 'text-green-500 dark:text-green-400';
    };

    const getPriorityIconColor = (priority: Review['priority']): string => {
        switch (priority) {
            case 'high': return 'text-red-500 dark:text-red-400';
            case 'medium': return 'text-orange-500 dark:text-orange-400';
            default: return ''; // No color for low
        }
    };

    const getAiRecClasses = (recommendation: Review['aiRecommendation']): string => {
        switch (recommendation) {
            case 'Approve': return 'text-green-600 dark:text-green-400';
            case 'Reject': return 'text-red-600 dark:text-red-400';
            case 'Review': return 'text-orange-500 dark:text-orange-400';
            default: return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getAiRecIcon = (recommendation: Review['aiRecommendation']) => {
        const className = "h-4 w-4 mr-0.5 flex-shrink-0"; // Slightly larger icon for AI
         switch (recommendation) {
            case 'Approve': return <CheckCircle className={cn(className, getAiRecClasses(recommendation))} />;
            case 'Reject': return <XCircle className={cn(className, getAiRecClasses(recommendation))} />;
            case 'Review': return <HelpCircle className={cn(className, getAiRecClasses(recommendation))} />;
            default: return null;
         }
    };

    const getIdForUrl = (id: string) => id.startsWith('#') ? id.substring(1) : id;

    // --- Render Logic ---
    return (
        // Minimal padding p-2
        <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 overflow-hidden">
            <TooltipProvider delayDuration={300}>
                <CardContent className="p-2">
                    <div className="flex items-center justify-between gap-3 w-full"> {/* Main flex row */}

                        {/* Left Group: Applicant, ID, Priority, Flags */}
                        <div className="flex items-center gap-2 flex-shrink min-w-0"> {/* Allow shrinking */}
                            {/* Priority Icon (only for High/Medium) */}
                            {review.priority !== 'low' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Star className={cn("h-3.5 w-3.5 flex-shrink-0", getPriorityIconColor(review.priority))} />
                                    </TooltipTrigger>
                                    <TooltipContent className='text-xs'>
                                        <p>{review.priority.charAt(0).toUpperCase() + review.priority.slice(1)} Priority</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {/* Applicant Name & ID (Smaller) */}
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate cursor-default" title={review.applicant}>
                                        {review.applicant}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className='text-xs'>
                                    <p>{review.applicant} ({review.id})</p>
                                </TooltipContent>
                            </Tooltip>


                            {/* Flags Icon (only if flags exist) */}
                            {review.flags && review.flags.length > 0 && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {/* Change background/text color instead of icon color for better visibility */}
                                        <span className='relative flex items-center justify-center'>
                                             <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                              {/* Optional: small badge count */}
                                              {review.flags.length > 1 && (
                                                   <span className="absolute -top-1 -right-1.5 inline-flex items-center justify-center px-1 py-0.5 text-[9px] font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                                      {review.flags.length}
                                                   </span>
                                              )}
                                        </span>

                                    </TooltipTrigger>
                                    <TooltipContent className='text-xs'>
                                        <p>Flags:</p>
                                        <ul className='list-disc list-inside'>
                                          {review.flags.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                         {/* Center Group: Visa Type, Passport (using Tooltips for labels) */}
                         <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              <Tooltip>
                                 <TooltipTrigger className='flex items-center'>
                                     <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                                     <span className="truncate max-w-[100px]">{review.type}</span> {/* Limit width */}
                                 </TooltipTrigger>
                                 <TooltipContent className='text-xs'><p>Visa Type: {review.type}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                 <TooltipTrigger className='flex items-center'>
                                     <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                                     <span className="truncate max-w-[80px]">{review.passport}</span> {/* Limit width */}
                                 </TooltipTrigger>
                                 <TooltipContent className='text-xs'><p>Passport: {review.passport}</p></TooltipContent>
                              </Tooltip>
                         </div>


                        {/* Right Group: Metrics (Risk, AI, SLA, Submission) */}
                        <div className="flex items-center gap-2 text-xs flex-shrink-0 ml-auto"> {/* ml-auto pushes it right */}
                             <Tooltip>
                                <TooltipTrigger className='flex items-center'>
                                    <TrendingUp className={cn("h-4 w-4 mr-0.5", getRiskColor(review.riskScore))} />
                                    <span className={cn("font-semibold", getRiskColor(review.riskScore))}>
                                        {review.riskScore}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className='text-xs'><p>Risk Score: {review.riskScore}/100</p></TooltipContent>
                             </Tooltip>

                            <Tooltip>
                                <TooltipTrigger className='flex items-center'>
                                     {getAiRecIcon(review.aiRecommendation)}
                                     {/* Maybe hide text label on small screens? */}
                                     {/* <span className={cn("font-semibold hidden sm:inline", getAiRecClasses(review.aiRecommendation))}>
                                         {review.aiRecommendation}
                                     </span> */}
                                </TooltipTrigger>
                                <TooltipContent className='text-xs'><p>AI: {review.aiRecommendation}</p></TooltipContent>
                            </Tooltip>

                            {review.slaRemaining !== 'N/A' && (
                                 <Tooltip>
                                     <TooltipTrigger className='flex items-center text-gray-500 dark:text-gray-400'>
                                         <Clock className="h-3.5 w-3.5 mr-0.5" />
                                         <span>{review.slaRemaining}</span>
                                     </TooltipTrigger>
                                     <TooltipContent className='text-xs'><p>SLA Remaining</p></TooltipContent>
                                 </Tooltip>
                             )}

                             <Tooltip>
                                 <TooltipTrigger className='flex items-center text-gray-500 dark:text-gray-400'>
                                     <CalendarDays className="h-3.5 w-3.5 mr-0.5" />
                                     <span>{review.submissionDate}</span>
                                 </TooltipTrigger>
                                 <TooltipContent className='text-xs'><p>Submitted</p></TooltipContent>
                             </Tooltip>

                        </div>

                        {/* Action Button (Keep minimal) */}
                        <div className="flex-shrink-0">
                            <Link href={`/dashboard/reviewer/${getIdForUrl(review.id)}`} passHref>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className='sr-only'>Review</span> {/* Screen reader text */}
                                </Button>
                            </Link>
                        </div>

                    </div>
                </CardContent>
            </TooltipProvider>
        </Card>
    );
};

export default ReviewCard;