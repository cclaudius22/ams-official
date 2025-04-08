// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
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
  
  // Extract just the numeric part from ID
  const displayId = review.id.includes('-') ? review.id.split('-').slice(1).join('-') : review.id;
  
  return (
    <div className="border-b border-gray-200 relative">
      {/* Left red border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
      
      <div className="pl-6 pr-4 pt-6 pb-2">
        {/* First row with ID and badges */}
        <div className="flex mb-2">
          <div className="text-sm font-medium text-gray-700">#{displayId}</div>
          <div className="flex gap-2 ml-4">
            {review.priority === 'high' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                High Priority
              </span>
            )}
            {review.flags.map((flag, i) => (
              <span key={i} className={cn(
                "px-2 py-0.5 text-xs font-medium rounded",
                flag.includes("Background Check") 
                  ? "bg-amber-100 text-amber-800" 
                  : flag.includes("Multiple") 
                    ? "bg-blue-100 text-blue-800"
                    : flag.includes("First Time")
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
              )}>
                {flag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Three column layout */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* Applicant info */}
          <div>
            <h3 className="text-gray-600 text-base mb-1">Applicant</h3>
            <p className="font-semibold text-lg mb-1">{review.applicant}</p>
            <p className="text-gray-500 text-sm">{review.type} • {review.country}</p>
          </div>
          
          {/* Risk Score */}
          <div>
            <h3 className="text-gray-600 text-base mb-1">Risk Score</h3>
            <p className={`font-semibold text-base ${riskDisplay.color}`}>
              {riskDisplay.text}
            </p>
          </div>
          
          {/* SLA and Recommendation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-600 text-base mb-1">SLA Remaining</h3>
              <p className="font-semibold text-base text-orange-500">{review.slaRemaining}</p>
            </div>
            
            <div>
              <h3 className="text-gray-600 text-base mb-1">AI Recommendation</h3>
              <p className="font-semibold text-base">{review.aiRecommendation}</p>
            </div>
          </div>
        </div>
        
        {/* Review Team section */}
        <div className="pt-4 pb-2 border-t border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Review Team</h4>
              <div className="flex gap-8">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Background: {review.team.background}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-purple-50 rounded flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Identity: {review.team.identity}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Document: {review.team.document}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Last updated {review.lastUpdated}
            </div>
          </div>
        </div>
        
        {/* Documents section */}
        <div className="py-3">
          <div className="text-gray-700">
            Documents: {' '}
            {review.documents.map((doc, index) => (
              <React.Fragment key={index}>
                <a href="#" className="text-blue-600 hover:underline">{doc}</a>
                {index < review.documents.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Button variant="outline" className="text-gray-800 bg-white border-gray-300 hover:bg-gray-50">
          Request Additional Docs
        </Button>
        
        <Button variant="outline" className="text-red-600 bg-white border-red-200 hover:bg-red-50">
          Escalate
        </Button>
        
        <Link href={`/dashboard/reviewer/${getIdForUrl(review.id)}`} passHref>
          <Button variant="outline" className="text-green-600 bg-white border-green-200 hover:bg-green-50">
            Start Review
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ReviewCard;