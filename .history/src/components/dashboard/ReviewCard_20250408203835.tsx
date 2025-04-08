import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, CheckCircle, XCircle, HelpCircle, User, Globe, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
    id: string;
    applicant: string;
    riskScore: number;
    slaRemaining: string;
    aiRecommendation: 'Approve' | 'Reject' | 'Review';
    priority: 'high' | 'medium' | 'low';
    flags: string[];
    submissionDate: string;
    lastUpdated: string;
    type: string;
    passport: string;
}

interface ReviewCardProps {
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const getRiskColor = (score: number): string => {
        if (score >= 75) return 'text-red-600 dark:text-red-400';
        if (score >= 40) return 'text-orange-500 dark:text-orange-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getPriorityClasses = (priority: Review['priority']): string => {
        switch (priority) {
            case 'high': return 'border-red-400 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-300 dark:bg-red-900/30';
            case 'medium': return 'border-orange-400 text-orange-600 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30';
            case 'low': return 'border-green-400 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30';
            default: return 'border-gray-300 text-gray-500 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-700/30';
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
        switch (recommendation) {
            case 'Approve': return <CheckCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
            case 'Reject': return <XCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
            case 'Review': return <HelpCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
            default: return null;
        }
    };

    const getIdForUrl = (id: string) => id.startsWith('#') ? id.substring(1) : id;

    return (
        <Card className="border shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 overflow-hidden">
            <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate flex-1" title={review.applicant}>
                                {review.applicant}
                            </h3>
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0">{review.id}</span>
                        </div>

                        <div className="flex items-center gap-x-2 text-xs text-gray-600 dark:text-gray-300 flex-wrap">
                            <span className="inline-flex items-center">
                                <FileText className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                                {review.type}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="inline-flex items-center">
                                <Globe className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                                {review.passport}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="inline-flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                                {review.submissionDate}
                            </span>
                        </div>
                    </div>

                    <Link href={`/dashboard/reviewer/${getIdForUrl(review.id)}`} passHref>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/30 flex-shrink-0">
                            Review
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {review.priority && review.priority !== 'low' && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-1 py-0 text-[10px] font-semibold leading-tight",
                                getPriorityClasses(review.priority)
                            )}
                        >
                            {review.priority === 'high' ? 'PREMIUM' : review.priority.toUpperCase()}
                        </Badge>
                    )}

                    <span className={cn("font-semibold inline-block", getRiskColor(review.riskScore))}>
                        Risk: {review.riskScore}
                    </span>

                    <span className={cn("font-semibold inline-flex items-center", getAiRecClasses(review.aiRecommendation))}>
                        {getAiRecIcon(review.aiRecommendation)}
                        AI: {review.aiRecommendation}
                    </span>

                    {review.slaRemaining !== 'N/A' && (
                        <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-0.5" />
                            {review.slaRemaining}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ReviewCard;