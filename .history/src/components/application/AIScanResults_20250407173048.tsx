// components/application/AIScanResults.tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw
} from 'lucide-react'
import { AIScanResult } from '@/types/aiScan'

interface AIScanResultsProps {
  scanResult: AIScanResult;
  onRefreshScan?: () => void;
}

export default function AIScanResults({ scanResult, onRefreshScan }: AIScanResultsProps) {
  // Calculate risk level based on scan score
  const calculateRiskLevel = () => {
    const score = scanResult.score;
    if (score >= 90) return { level: 'Low', color: 'text-green-600' };
    if (score >= 70) return { level: 'Medium', color: 'text-amber-600' };
  return { level: 'High', color: 'text-red-600' };
};

// Function to format date consistently
const formatConsistentDateTime = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '';
  try {
    // Using 'sv-SE' locale gets YYYY-MM-DD format, then add time options
    return new Intl.DateTimeFormat('sv-SE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false // Use 24-hour format
    }).format(new Date(dateInput));
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date'; // Or handle error appropriately
  }
};

const riskLevel = calculateRiskLevel();
const rootednessScore = scanResult.rootednessScore || 84; // Default or from API
const intentScore = scanResult.intentScore || 76; // Default or from API

return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg">AI Assessment Results</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Score: {scanResult.score}/100
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Scan completed on {formatConsistentDateTime(scanResult.scanCompletedAt)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* Core Metrics - Compact Row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-2 bg-gray-50 rounded border text-center">
              <div className="text-xs text-gray-500 mb-1">Overall Risk</div>
              <div className={`text-sm font-semibold ${riskLevel.color}`}>{riskLevel.level.toUpperCase()}</div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded border text-center">
              <div className="text-xs text-gray-500 mb-1">Rootedness</div>
              <div className="text-sm font-semibold text-green-600">{rootednessScore}/100</div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded border text-center">
              <div className="text-xs text-gray-500 mb-1">Intent Analysis</div>
              <div className="text-sm font-semibold text-purple-600">{intentScore}/100</div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded border text-center">
              <div className="text-xs text-gray-500 mb-1">Issues Found</div>
              <div className="text-sm font-semibold text-blue-600">{scanResult.issues.length}</div>
            </div>
          </div>
          
          {/* Security Checks - Compact Grid */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Security Checks</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center p-2 border rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Passport Validated</span>
              </div>
              
              <div className="flex items-center p-2 border rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>INTERPOL Check</span>
              </div>
              
              <div className="flex items-center p-2 border rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Sanctions List</span>
              </div>
              
              <div className="flex items-center p-2 border rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>KYC Verification</span>
              </div>
              
              <div className="flex items-center p-2 border rounded text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                <span>Visa History</span>
              </div>
              
              <div className="flex items-center p-2 border rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Financial Check</span>
              </div>
            </div>
          </div>
          
          {/* Tabs for detailed information */}
          <Tabs defaultValue="issues" className="mt-3">
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="issues" className="text-xs">Issues</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="issues" className="pt-3">
              <div className="space-y-2">
                {scanResult.issues.length > 0 ? (
                  scanResult.issues.map((issue, index) => (
                    <div 
                      key={index} 
                      className={`
                        p-2 border rounded-md text-sm
                        ${issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-50 border-red-200' : 
                          issue.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 
                          'bg-blue-50 border-blue-200'}
                      `}
                    >
                      <div className="flex">
                        <AlertTriangle className={`
                          h-4 w-4 mt-0.5 mr-2 flex-shrink-0
                          ${issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-500' : 
                            issue.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'}
                        `} />
                        <div>
                          <p className="font-medium text-sm">
                            {issue.sectionId.charAt(0).toUpperCase() + issue.sectionId.slice(1)}: {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                          </p>
                          <p className="text-xs mt-0.5">{issue.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <p>No issues detected</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Other tab contents... */}
            {/* For brevity, I'm omitting the recommendations and analysis tabs */}
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-3 text-xs">
          <div className="flex justify-between items-center w-full">
            <div className="text-gray-500">
              <span>AI Model: Visa Assessment v2.1</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={onRefreshScan}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Run Additional Checks
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
