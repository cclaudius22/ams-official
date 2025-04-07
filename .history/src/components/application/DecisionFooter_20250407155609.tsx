// src/components/application/DecisionFooter.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface DecisionFooterProps {
  totalSections: number;
  decidedSections: number;
  allDecided: boolean;
  onApprove: () => void;
  onRefer: () => void;
}

export default function DecisionFooter({
  totalSections,
  decidedSections,
  allDecided,
  onApprove,
  onRefer
}: DecisionFooterProps) {
  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border sticky bottom-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Final Decision</h3>
          <p className="text-sm text-gray-500">
            {decidedSections} of {totalSections} sections reviewed
          </p>
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={onRefer}
            disabled={!allDecided}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Refer for Additional Review
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onApprove}
            disabled={!allDecided}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve Application
          </Button>
        </div>
      </div>
    </div>
  );
}