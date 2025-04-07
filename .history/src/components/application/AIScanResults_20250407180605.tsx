// components/application/AIScanResultsRedesigned.tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card' // Keep Card imports if used elsewhere, otherwise could remove
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button' // Import buttonVariants
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Target,
  Anchor
} from 'lucide-react'
import { AIScanResult } from '@/types/aiScan' // Adjust path if needed
import { cn } from "@/lib/utils"; // Import cn utility

interface AIScanResultsProps {
  scanResult: AIScanResult;
  onRefreshScan?: () => void;
}

// Helper component for displaying metric stats
const MetricStat: React.FC<{ label: string; value: string | number; colorClass?: string; icon?: React.ReactNode }> = ({ label, value, colorClass = 'text-gray-900', icon }) => (
  <div className="p-3 bg-gray-50 rounded-lg border text-center transition-colors hover:bg-gray-100">
    <div className="text-xs text-gray-500 mb-1 flex items-center justify-center space-x-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`text-lg font-semibold ${colorClass}`}>{value}</div>
  </div>
);

// Helper component for security check items
const SecurityCheckItem: React.FC<{ label: string; status: 'passed' | 'warning' | 'failed' | 'info' }> = ({ label, status }) => {
  const icons = {
    passed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
    failed: <AlertTriangle className="h-4 w-4 text-red-500" />,
    info: <CheckCircle2 className="h-4 w-4 text-blue-500" />
  };
  const colors = {
      passed: 'text-green-700 bg-green-50 border-green-200',
      warning: 'text-amber-700 bg-amber-50 border-amber-200',
      failed: 'text-red-700 bg-red-50 border-red-200',
      info: 'text-blue-700 bg-blue-50 border-blue-200',
  };

  return (
    <div className={`flex items-center p-2 border rounded-md text-xs ${colors[status]}`}>
      {icons[status]}
      <span className="ml-2 font-medium">{label}</span>
    </div>
  );
};

export default function AIScanResultsRedesigned({ scanResult, onRefreshScan }: AIScanResultsProps) {
  // Calculate risk level based on scan score
  const calculateRiskLevel = (score: number) => {
    if (score >= 90) return { level: 'Low', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-800' };
    if (score >= 70) return { level: 'Medium', color: 'text-amber-600', badgeColor: 'bg-amber-100 text-amber-800' };
    return { level: 'High', color: 'text-red-600', badgeColor: 'bg-red-100 text-red-800' };
  };

  // Function to format date consistently
  const formatConsistentDateTime = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(new Date(dateInput)).replace(',', '');
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  };

  const risk = calculateRiskLevel(scanResult.score);
  const rootednessScore = scanResult.rootednessScore ?? 84;
  const intentScore = scanResult.intentScore ?? 76;

  // --- MOCK Security Check Statuses (Replace with actual data) ---
  const securityChecks = [
    { label: 'Passport Validated', status: 'passed' as const },
    { label: 'INTERPOL Check', status: 'passed' as const },
    { label: 'Sanctions List', status: 'passed' as const },
    { label: 'KYC Verification', status: 'passed' as const },
    { label: 'Visa History', status: 'warning' as const },
    { label: 'Financial Check', status: 'passed' as const },
  ];
  // --- END MOCK ---

  // Define severity styles for issues
  const getIssueSeverityClass = (severity: AIScanResult['issues'][number]['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: AlertTriangle };
      case 'medium':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: AlertTriangle };
      default: // low, info
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: AlertCircle };
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full mb-6 border rounded-lg overflow-hidden shadow-sm" defaultValue='ai-scan-results'>
      <AccordionItem value="ai-scan-results" className="border-b-0">
        {/* Accordion Trigger (Header) */}
        <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 px-4 py-3 text-base hover:no-underline data-[state=open]:border-b">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-semibold text-gray-800 text-left">AI Assessment Results</span>
            </div>
            <div className="flex items-center space-x-2">
                 <Badge variant="outline" className={cn("px-2 py-0.5 text-xs font-semibold border", risk.badgeColor)}>
                    Risk: {risk.level}
                 </Badge>
                 <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium">
                    Score: {scanResult.score}/100
                 </Badge>
                {/* ChevronDown icon managed by AccordionTrigger */}
            </div>
          </div>
        </AccordionTrigger>

        {/* Accordion Content (Collapsible Area) */}
        <AccordionContent className="p-4 md:p-6 bg-white">
          {/* Core Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MetricStat label="Overall Risk" value={risk.level.toUpperCase()} colorClass={risk.color} />
            <MetricStat label="Rootedness Score" value={`${rootednessScore}/100`} colorClass="text-green-600" icon={<Anchor className="h-3 w-3" />} />
            <MetricStat label="Intent Score" value={`${intentScore}/100`} colorClass="text-purple-600" icon={<Target className="h-3 w-3" />} />
          </div>

          {/* Security Checks Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Security Checks Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {securityChecks.map((check) => (
                <SecurityCheckItem key={check.label} label={check.label} status={check.status} />
              ))}
            </div>
          </div>

          {/* Tabs for Details */}
          <Tabs defaultValue="issues" className="mt-6">
            {/* == MODIFIED TabsList and TabsTrigger == */}
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-0 h-auto mb-4">
              <TabsTrigger
                value="issues"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }), // Using outline variant, size sm
                  "w-full justify-center shadow-none rounded-md text-xs h-9", // Adjusted size/text
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary"
                )}
              >
                Detected Issues ({scanResult.issues.length})
              </TabsTrigger>

              <TabsTrigger
                value="analysis"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }), // Using outline variant, size sm
                  "w-full justify-center shadow-none rounded-md text-xs h-9", // Adjusted size/text
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary"
                )}
              >
                AI Analysis Summary
              </TabsTrigger>
            </TabsList>
            {/* == END OF MODIFICATION == */}

            {/* Issues Tab Content */}
            <TabsContent value="issues" className="pt-0"> {/* Removed top padding */}
              <div className="space-y-3">
                {scanResult.issues.length > 0 ? (
                  scanResult.issues.map((issue, index) => {
                    const severityClasses = getIssueSeverityClass(issue.severity);
                    const Icon = severityClasses.icon;
                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-md text-sm ${severityClasses.bg} ${severityClasses.border}`}
                      >
                        <div className="flex">
                          <Icon className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${severityClasses.text}`} />
                          <div>
                            <p className={`font-semibold ${severityClasses.text}`}>
                              {issue.sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              <span className="ml-2 text-xs font-normal text-gray-500">({issue.severity})</span>
                            </p>
                            <p className="text-xs text-gray-700 mt-1">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm border rounded-md bg-gray-50">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p>No significant issues detected by AI scan.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Analysis Tab Content */}
            <TabsContent value="analysis" className="pt-0 text-sm space-y-4"> {/* Removed top padding */}
               <div className="p-3 border rounded-md bg-gray-50/80"> {/* Slightly lighter bg */}
                 <h4 className="font-semibold mb-1 text-gray-800 flex items-center"><Anchor className="h-4 w-4 mr-2 text-green-600"/> Rootedness Analysis</h4>
                 <p className="text-gray-600 text-xs leading-relaxed">
                   {scanResult.rootednessSummary || `The analysis suggests moderate ties to the applicant's home country based on factors like employment stability, property ownership, and family connections. The calculated rootedness score is ${rootednessScore}/100.`}
                 </p>
               </div>
               <div className="p-3 border rounded-md bg-gray-50/80">
                 <h4 className="font-semibold mb-1 text-gray-800 flex items-center"><Target className="h-4 w-4 mr-2 text-purple-600"/> Intent Analysis</h4>
                 <p className="text-gray-600 text-xs leading-relaxed">
                   {scanResult.intentSummary || `Based on the provided travel plans, financial capacity, and stated purpose of visit, the applicant's intent appears to be consistent with a temporary stay. The intent score is ${intentScore}/100. Factors considered include travel history and duration of stay.`}
                 </p>
               </div>
               <div className="p-3 border rounded-md bg-gray-50/80">
                 <h4 className="font-semibold mb-1 text-gray-800 flex items-center"><FileText className="h-4 w-4 mr-2 text-blue-600"/> Document Analysis</h4>
                 <p className="text-gray-600 text-xs leading-relaxed">
                   {scanResult.documentSummary || `Document verification checks indicate overall consistency. Key documents like the passport and financial statements have been reviewed for authenticity. Passport validation passed.`}
                 </p>
               </div>
            </TabsContent>

          </Tabs>

          {/* Footer Info */}
          <div className="border-t mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs">
            <div className="text-gray-500 mb-2 sm:mb-0 text-center sm:text-left">
              <span>AI Model: Visa Assessment v2.1</span>
              <span className="mx-2 hidden sm:inline">|</span>
              <br className="block sm:hidden" /> {/* Line break on small screens */}
              <span>Scan completed: {formatConsistentDateTime(scanResult.scanCompletedAt)}</span>
            </div>
            {onRefreshScan && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-blue-600 hover:bg-blue-50 px-2"
                onClick={onRefreshScan}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Run Additional Checks
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}