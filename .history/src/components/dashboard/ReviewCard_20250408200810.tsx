// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
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
  // Function to get color based on risk score
  const getRiskScoreDisplay = (score: number) => {
    if (score >= 70) return { text: `High (${score}/100)`, color: 'text-red-600' };
    if (score >= 50) return { text: `Medium (${score}/100)`, color: 'text-orange-600' };
    return { text: `Low (${score}/100)`, color: 'text-green-600' };
  };
  
  // Format the risk score display
  const riskDisplay = getRiskScoreDisplay(review.riskScore);
  
  // Function to format the ID for URL (remove # if present)
  const getIdForUrl = (id: string) => id.startsWith('#') ? id.substring(1) : id;
  
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mt-4 overflow-hidden">
      {/* Red left border for priority items */}
      <div className="flex">
        <div className="w-1 bg-red-500 flex-shrink-0"></div>
        
        <CardContent className="flex-1 p-0">
          {/* Main content area */}
          <div className="p-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Applicant info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{review.id}</span>
                  
                  {/* Priority badges */}
                  <div className="flex gap-1">
                    {review.priority === 'high' && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none text-xs px-2 py-0.5">
                        High Priority
                      </Badge>
                    )}
                    
                    {/* Additional flags/badges */}
                    {review.flags.map((flag, index) => (
                      <Badge key={index} className={cn(
                        "text-xs px-2 py-0.5 border-none",
                        flag.includes("Background Check") ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : 
                        flag.includes("Multiple") ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                        flag.includes("First Time") ? "bg-green-100 text-green-800 hover:bg-green-100" :
                        "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      )}>
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Applicant</h3>
                  <p className="text-lg font-semibold">{review.applicant}</p>
                  <p className="text-sm text-gray-600">
                    {review.type} • {review.country}
                  </p>
                </div>
              </div>
              
              {/* Middle column - Risk and SLA */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Risk Score</h3>
                  <p className={`text-lg font-semibold ${riskDisplay.color}`}>
                    {riskDisplay.text}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">SLA Remaining</h3>
                  <p className="text-lg font-semibold text-orange-500">
                    {review.slaRemaining}
                  </p>
                </div>
              </div>
              
              {/* Right column - AI Recommendation */}
              <div>
                <h3 className="text-lg font-medium">AI Recommendation</h3>
                <p className="text-lg font-semibold">{review.aiRecommendation}</p>
              </div>
            </div>
          </div>
          
          {/* Review Team Section */}
          <div className="px-6 pt-4 pb-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-medium mb-2">Review Team</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-blue-600">✓</span>
                    </div>
                    <span>Background: {review.team.background}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-purple-600">✓</span>
                    </div>
                    <span>Identity: {review.team.identity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-green-600">✓</span>
                    </div>
                    <span>Document: {review.team.document}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated {review.lastUpdated}
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Documents:</span>
              {review.documents.map((doc, index) => (
                <React.Fragment key={doc}>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    {doc}
                  </a>
                  {index < review.documents.length - 1 && (
                    <span className="mx-1 text-gray-400">,</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50 text-gray-700"
            >
              Request Additional Docs
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300"
            >
              Escalate
            </Button>
            
            <Link href={`/dashboard/reviewer/${getIdForUrl(review.id)}`} passHref>
              <Button 
                variant="outline" 
                className="bg-white hover:bg-green-50 text-green-600 border-green-200 hover:border-green-300"
              >
                Start Review
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ReviewCard;