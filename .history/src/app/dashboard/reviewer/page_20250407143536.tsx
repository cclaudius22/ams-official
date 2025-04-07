'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import {
  Bell,
  MessageSquare,
  Clock,
  Users,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Shield,
  UserCheck,
  Fingerprint,
  Flag,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Inbox,
  Settings,
  History,
  ShieldCheck,
  Eye,
  Activity,
  AlertCircle,
  Download,
  PlusCircle,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Plane,
  HelpCircle,
  Edit,
  ExternalLink,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Globe,
  Award,
  Coffee,
  BookOpen
} from 'lucide-react'

/**
 * Types for the application data structure
 */
interface ApplicationSection {
  status: string;
  validationStatus: string;
  data: any;
  updatedAt: string;
}

interface ScanIssue {
  id: string;
  sectionId: string;
  fieldId?: string;
  type: 'missing' | 'invalid' | 'inconsistent' | 'suspicious' | 'incomplete';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context?: any;
}

interface ScanRecommendation {
  id: string;
  relatedIssueIds: string[];
  message: string;
  actionType: 'update' | 'upload' | 'verify' | 'contact_support' | 'resubmit';
  actionLink?: string;
}

interface AIScanResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scanStartedAt?: Date;
  scanCompletedAt?: Date;
  isValid: boolean;
  issues: ScanIssue[];
  recommendations: ScanRecommendation[];
  score: number;
  error?: string;
}

interface ApplicationData {
  applicationId: string;
  userId: string;
  visaTypeId: string;
  currentStage: string;
  verificationPath: string;
  processingType: string;
  status: string;
  sections: Record<string, ApplicationSection>;
  progress: {
    stageProgress: Array<{
      stage: string;
      status: string;
      completedAt: string | null;
    }>;
    overallProgress: number;
    lastUpdated: string;
  };
  metadata: any;
  timeline: Array<any>;
}

// Mock AI Scan Result (would be fetched from API in real implementation)
const mockScanResult: AIScanResult = {
  status: 'completed',
  scanStartedAt: new Date('2025-03-25T14:30:00Z'),
  scanCompletedAt: new Date('2025-03-25T14:32:15Z'),
  isValid: false,
  issues: [
    {
      id: 'suspicious-travel-pattern',
      sectionId: 'travel',
      type: 'suspicious',
      severity: 'medium',
      message: 'Multiple short tourism trips detected - may require additional scrutiny',
    },
    {
      id: 'inconsistent-name-professional',
      sectionId: 'professional',
      fieldId: 'fullName',
      type: 'inconsistent',
      severity: 'medium',
      message: 'Name in professional section does not match passport',
      context: {
        passportName: 'john james doe',
        professionalName: 'john j. doe',
      }
    }
  ],
  recommendations: [
    {
      id: 'check-name-consistency',
      relatedIssueIds: ['inconsistent-name-professional'],
      message: 'Verify name consistency across all documents',
      actionType: 'verify',
    },
    {
      id: 'verify-travel-history',
      relatedIssueIds: ['suspicious-travel-pattern'],
      message: 'Review travel history for patterns',
      actionType: 'verify',
    }
  ],
  score: 78
};

// Mock application data
const mockApplicationData: ApplicationData = {
  applicationId: 'VK-2503-HPI-HD0',
  userId: '67dbacf5adfab99d238910bd',
  visaTypeId: 'high-potential-individual',
  currentStage: 'REVIEW_AND_CONFIRM',
  verificationPath: 'standard',
  processingType: 'standard',
  status: 'draft',
  progress: {
    stageProgress: [
      {
        stage: 'ELIGIBILITY_CHECK',
        status: 'completed',
        completedAt: '2025-03-20T05:52:52.723Z'
      },
      {
        stage: 'PASSPORT_UPLOAD',
        status: 'completed',
        completedAt: '2025-03-21T18:45:54.501Z'
      },
      {
        stage: 'KYC_LIVENESS',
        status: 'completed',
        completedAt: '2025-03-21T18:45:54.501Z'
      },
      // Other stages would be here
    ],
    overallProgress: 77,
    lastUpdated: '2025-03-21T18:46:10.986Z'
  },
  metadata: {
    score: 135,
    visaTracking: {
      initializedFrom: 'local_file',
      visaTypeRecordId: {
        $oid: '67561713fa523141f088ec81'
      }
    }
  },
  timeline: [],
  sections: {
    passport: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'passport',
        documentNumber: 'P123456789',
        surname: 'Doe',
        givenNames: 'John James',
        dateOfBirth: '1990-01-01',
        dateOfExpiry: '2030-01-01',
        nationality: 'USA',
        gender: 'M',
        documentType: 'Passport',
        issuingCountry: 'USA',
        mrzData: 'P<USADOE<<JOHN<JAMES<<<<<<<<<<<<<<<<<<<<<<<<<<'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    kyc: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'kyc',
        selfieId: 'demo-selfie-001'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    residency: {
      status: 'complete',
      validationStatus: 'success',
      data: {
        sectionId: 'residency',
        documents: [
          {
            type: 'utility_bill',
            fileUrl: 'https://placehold.co/400x500/png?text=Utility+Bill',
            fileName: 'utility_bill.pdf'
          },
          {
            type: 'council_tax',
            fileUrl: 'https://placehold.co/400x500/png?text=Council+Tax',
            fileName: 'council_tax.pdf'
          }
        ],
        verificationTimestamp: '2025-03-20T05:54:23.614Z',
        countryCode: 'GB',
        verificationCompletedTimestamp: '2025-03-20T05:54:24.812Z'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    visas: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'visas',
        visaNumber: 'SIMULATED987654',
        type: 'UK Indefinite Leave to Remain',
        issueDate: '2023-01-01',
        expiryDate: '2024-01-01',
        issuingCountry: 'Simuland',
        holderName: 'Jane Doe',
        nationality: 'Simulant',
        scanQuality: 'excellent'
      },
      updatedAt: '2025-03-21T18:45:54.501Z'
    },
    photo: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'photo'
      },
      updatedAt: '2025-03-21T18:45:54.501Z'
    },
    professional: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'professional',
        employmentStatus: 'employed',
        companyName: 'Open Visa Ltd',
        jobRole: 'CEO',
        completedAt: '2025-03-21T18:34:49.552Z'
      },
      updatedAt: '2025-03-21T18:45:54.501Z'
    },
    financial: {
      status: 'complete',
      validationStatus: 'success',
      data: {
        sectionId: 'financial',
        statements: [
          {
            id: 'stmt_1742450835777',
            accountName: 'Chris Claudius',
            bank: 'Barclays',
            accountNumber: '121212121212',
            bankIdentifier: '43-03-45',
            bankIdentifierType: 'sort_code',
            fileUrl: 'blob:http://localhost:3000/c9877718-6059-4fd3-b3cd-978e7c1545d3',
            uploadedAt: '2025-03-20T06:07:15.777Z'
          }
        ],
        verifiedAt: '2025-03-20T06:07:19.614Z',
        sufficientFunds: true
      },
      updatedAt: '2025-03-21T18:45:54.501Z'
    },
    travel: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'travel',
        intendedDateOfArrival: '2025-03-30',
        intendedDateOfDeparture: '2025-04-30',
        arrivalCity: 'Glasgow',
        modeOfTransport: [
          'Air'
        ],
        numberOfIntendedEntries: 'Single entry',
        costOfTravellingAndLiving: {
          coveredBy: [
            'Applicant'
          ],
          meansOfSupport: [
            'Cash'
          ],
          amountAvailable: '5000'
        },
        accommodation: {
          type: 'Other',
          name: 'Friends House',
          address: '11 Hubert Grove, London, SW9, 9PA',
          bookingReference: '',
          telephoneNumber: '',
          emailAddress: ''
        },
        documents: [
          {
            id: 'doc_1742452586864',
            type: 'Flight Ticket',
            fileUrl: 'blob:http://localhost:3000/437b734c-89ef-4a00-a2c6-d53abbba3dd7',
            uploadedAt: '2025-03-20T06:36:26.864Z'
          },
          {
            id: 'doc_1742452600399',
            type: 'Accommodation Proof',
            fileUrl: 'blob:http://localhost:3000/0bca730e-e6ce-44b2-81a4-4a166982c593',
            uploadedAt: '2025-03-20T06:36:40.399Z'
          }
        ],
        verifiedAt: '2025-03-20T06:36:46.488Z',
        completedAt: '2025-03-21T18:34:52.944Z'
      },
      updatedAt: '2025-03-21T18:45:54.502Z'
    },
    travelInsurance: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'travelInsurance',
        policy: {
          id: 'policy_1742452740359',
          provider: 'Allianz',
          policyNumber: '1212121212121',
          effectiveDate: '2025-03-01',
          expirationDate: '2025-03-30',
          coverageAmount: 250000,
          currency: 'GBP',
          coverageType: [
            'Medical Emergencies',
            'Hospitalization',
            'Trip Cancellation',
            'Lost Luggage'
          ],
          fileUrl: 'blob:http://localhost:3000/8bc599e0-3033-4c21-82f1-a597982684fd',
          uploadedAt: '2025-03-20T06:39:00.359Z'
        },
        verifiedAt: '2025-03-20T06:39:00.359Z',
        isValid: true
      },
      updatedAt: '2025-03-21T18:45:54.502Z'
    },
    documents: {
      status: 'in_progress',
      validationStatus: 'pending',
      data: {
        sectionId: 'documents',
        documents: {
          '675decf4c420de50ef75337a': {
            status: 'pending',
            documentId: '675decf4c420de50ef75337a'
          }
        }
      },
      updatedAt: '2025-03-21T18:35:04.562Z'
    }
  }
};

/**
 * Format a date string to a readable format
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Section Card component to display application section data
 */
interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  section: ApplicationSection;
  scanIssues?: ScanIssue[];
  onApprove: () => void;
  onRefer: () => void;
  onAddNote: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  section,
  scanIssues = [],
  onApprove,
  onRefer,
  onAddNote
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasCriticalIssues = scanIssues.some(issue => issue.severity === 'critical' || issue.severity === 'high');
  const hasWarningIssues = scanIssues.some(issue => issue.severity === 'medium');

  const renderCardContent = () => {
    const { data } = section;
    
    // Render different content based on section type
    switch (data.sectionId) {
      case 'passport':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{data.surname}, {data.givenNames}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium">{data.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passport Number</p>
                <p className="font-medium">{data.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(data.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{formatDate(data.dateOfExpiry)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Issuing Country</p>
              <p className="font-medium">{data.issuingCountry}</p>
            </div>
          </>
        );
      
      case 'kyc':
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center">
              <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">KYC Verification Status</p>
              <Badge className="mt-1 bg-green-100 text-green-800">Verified</Badge>
            </div>
          </div>
        );
      
      case 'residency':
        return (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Country of Residence</p>
              <p className="font-medium">{data.countryCode}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Supporting Documents</p>
              {data.documents?.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">{doc.type.replace('_', ' ')}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </>
        );

      case 'professional':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Employment Status</p>
                <p className="font-medium capitalize">{data.employmentStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Job Role</p>
                <p className="font-medium">{data.jobRole}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium">{data.companyName}</p>
              </div>
            </div>
          </>
        );

      case 'financial':
        return (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Sufficient Funds</p>
                <Badge className={`${data.sufficientFunds ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {data.sufficientFunds ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Bank Statements</p>
              {data.statements?.map((stmt: any) => (
                <div key={stmt.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{stmt.bank}</span>
                    <Badge variant="outline">{stmt.bankIdentifierType}: {stmt.bankIdentifier}</Badge>
                  </div>
                  <div className="text-sm text-gray-700">Account: {stmt.accountName}</div>
                  <div className="text-sm text-gray-500">Uploaded on {new Date(stmt.uploadedAt).toLocaleDateString()}</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <FileText className="h-4 w-4 mr-2" />
                    View Statement
                  </Button>
                </div>
              ))}
            </div>
          </>
        );

      case 'travel':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Arrival Date</p>
                <p className="font-medium">{formatDate(data.intendedDateOfArrival)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Departure Date</p>
                <p className="font-medium">{formatDate(data.intendedDateOfDeparture)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival City</p>
                <p className="font-medium">{data.arrivalCity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transport Mode</p>
                <p className="font-medium">{data.modeOfTransport.join(', ')}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Accommodation</p>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{data.accommodation.name}</p>
                <p className="text-sm text-gray-700">{data.accommodation.address}</p>
                <p className="text-sm text-gray-500">Type: {data.accommodation.type}</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Travel Documents</p>
              {data.documents?.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">{doc.type}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </>
        );

      case 'travelInsurance':
        return (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium">{data.policy.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Policy Number</p>
                  <p className="font-medium">{data.policy.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Effective Date</p>
                  <p className="font-medium">{formatDate(data.policy.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{formatDate(data.policy.expirationDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coverage Amount</p>
                <p className="font-medium">{data.policy.coverageAmount.toLocaleString()} {data.policy.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coverage Types</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.policy.coverageType.map((type: string, index: number) => (
                    <Badge key={index} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View Policy Document
              </Button>
            </div>
          </>
        );

      case 'documents':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Required Documents</p>
            <div className="p-4 bg-yellow-50 rounded-md">
              <p className="text-amber-700 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Documents section is in progress
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p>No detailed information available</p>
          </div>
        );
    }
  };

  return (
    <Card className={`mb-4 ${hasCriticalIssues ? 'border-red-300' : hasWarningIssues ? 'border-amber-300' : ''}`}>
      <CardHeader className={`${hasCriticalIssues ? 'bg-red-50' : hasWarningIssues ? 'bg-amber-50' : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {section.validationStatus === 'success' && (
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            )}
            {section.validationStatus === 'pending' && (
              <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
            )}
            {section.validationStatus === 'error' && (
              <Badge className="bg-red-100 text-red-800">Error</Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Less details' : 'More details'}
            </Button>
          </div>
        </div>
        {scanIssues.length > 0 && (
          <div className="mt-2">
            {scanIssues.map((issue, index) => (
              <Alert 
                key={index} 
                variant={
                  issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 
                  issue.severity === 'medium' ? 'default' : 'outline'
                }
                className={`
                  mb-2 py-2 
                  ${issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 
                    issue.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
                    'bg-blue-50 border-blue-200 text-blue-800'}
                `}
              >
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <AlertTitle className="text-sm font-medium">{issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue</AlertTitle>
                    <AlertDescription className="text-xs">{issue.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-4">
          {renderCardContent()}
        </CardContent>
      )}
      
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddNote}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Add Note
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefer}
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Refer
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onApprove}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Main Official Review Page component
 */
export default function OfficialReviewPage() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({});
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [finalDecision, setFinalDecision] = useState<'approve' | 'refer' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scanResult] = useState<AIScanResult>(mockScanResult);
  const [applicationData] = useState<ApplicationData>(mockApplicationData);

  // Get issues for a specific section
  const getIssuesForSection = (sectionId: string) => {
    return scanResult.issues.filter(issue => issue.sectionId === sectionId);
  };

  // Handle section approval
  const handleApproveSection = (sectionId: string) => {
    setDecisions(prev => ({
      ...prev,
      [sectionId]: 'approve'
    }));
  };

  // Handle section referral
  const handleReferSection = (sectionId: string) => {
    setDecisions(prev => ({
      ...prev,
      [sectionId]: 'refer'
    }));
  };

  // Handle adding a note to a section
  const handleAddNote = (sectionId: string) => {
    setActiveNoteSection(sectionId);
    setNoteText(notes[sectionId] || '');
  };

  // Save the note for a section
  const saveNote = () => {
    if (activeNoteSection) {
      setNotes(prev => ({
        ...prev,
        [activeNoteSection]: noteText
      }));
      setActiveNoteSection(null);
      setNoteText('');
    }
  };

  // Check if all sections have been decided (approved or referred)
  const allSectionsDecided = () => {
    const enabledSections = Object.keys(applicationData.sections);
    return enabledSections.every(section => decisions[section] === 'approve' || decisions[section] === 'refer');
  };

  // Handle final application decision
  const handleFinalDecision = (decision: 'approve' | 'refer') => {
    setFinalDecision(decision);
    setShowConfirmDialog(true);
  };

  // Submit final decision
  const submitFinalDecision = () => {
    // This would make an API call to submit the decision in a real app
    console.log('Submitting final decision:', finalDecision);
    console.log('Section decisions:', decisions);
    console.log('Notes:', notes);
    setShowConfirmDialog(false);
    
    // Redirect would happen here in a real app
    alert(`Application ${finalDecision === 'approve' ? 'approved' : 'referred for additional review'}`);
  };

  // Group sections for two-column layout
  const leftColumnSections = [
    { id: 'passport', title: 'Passport Information', icon: <FileText className="h-5 w-5 text-blue-500" /> },
    { id: 'kyc', title: 'Identity Verification', icon: <Fingerprint className="h-5 w-5 text-purple-500" /> },
    { id: 'photo', title: 'Visa Photo', icon: <User className="h-5 w-5 text-green-500" /> },
    { id: 'residency', title: 'Residence Information', icon: <MapPin className="h-5 w-5 text-red-500" /> },
    { id: 'visas', title: 'Previous Visas', icon: <Globe className="h-5 w-5 text-indigo-500" /> },
  ];

  const rightColumnSections = [
    { id: 'professional', title: 'Professional Information', icon: <Briefcase className="h-5 w-5 text-orange-500" /> },
    { id: 'financial', title: 'Financial Information', icon: <CreditCard className="h-5 w-5 text-emerald-500" /> },
    { id: 'travel', title: 'Travel Details', icon: <Plane className="h-5 w-5 text-cyan-500" /> },
    { id: 'travelInsurance', title: 'Travel Insurance', icon: <Shield className="h-5 w-5 text-pink-500" /> },
    { id: 'documents', title: 'Required Documents', icon: <FileText className="h-5 w-5 text-amber-500" /> },
  ];

  // Calculate overall risk based on scan result
  const calculateRiskLevel = () => {
    const score = scanResult.score;
    if (score >= 90) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 70) return { level: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const riskLevel = calculateRiskLevel();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Reusing the existing sidebar from your OfficerDashboard */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-2 bg-blue-50 rounded-lg">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              RJ
            </div>
            <div>
              <h3 className="font-medium">Rachel Johnson</h3>
              <p className="text-sm text-blue-600">Senior Visa Officer</p>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Inbox className="h-5 w-5" />
              <span>My Queue</span>
              <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">23</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5" />
              <span>Pending Reviews</span>
              <span className="ml-auto bg-gray-100 px-2 py-1 rounded-full text-xs">12</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5" />
              <span>Completed</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Flag className="h-5 w-5" />
              <span>Escalated Cases</span>
              <span className="ml-auto bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">3</span>
            </a>
          </nav>

          <div className="my-6 border-t" />

          {/* Tools Section */}
          <h3 className="text-sm font-medium text-gray-500 mb-3">TOOLS</h3>
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Fingerprint className="h-5 w-5" />
              <span>Verification Tools</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <ShieldCheck className="h-5 w-5" />
              <span>Security Checks</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <History className="h-5 w-5" />
              <span>Recent Checks</span>
            </a>
          </nav>

          <div className="my-6 border-t" />

          {/* Team Section */}
          <h3 className="text-sm font-medium text-gray-500 mb-3">TEAM</h3>
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Users className="h-5 w-5" />
              <span>Office Team</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
              <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">4</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b">
          <div className="flex justify-between items-center px-6 py-3">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-2">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Queue
              </Button>
              <h1 className="text-xl font-medium ml-2">Application Review</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="relative">
                <MessageSquare className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                  5
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Application Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold">High Potential Individual Visa</h1>
                  <Badge className="bg-blue-100 text-blue-800">
                    {applicationData.processingType.charAt(0).toUpperCase() + applicationData.processingType.slice(1)} Path
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{applicationData.applicationId}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{applicationData.sections.passport?.data.givenNames} {applicationData.sections.passport?.data.surname}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Submitted: {formatDate(applicationData.progress.lastUpdated)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="text-blue-600">
                  <Eye className="h-4 w-4 mr-2" />
                  View as Applicant
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

 {/* AI Scan Results - Refined, More Subtle Design */}
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
        Scan completed on {scanResult.scanCompletedAt?.toLocaleString()}
      </CardDescription>
    </CardHeader>
    
    <CardContent className="pt-4">
      {/* Core Metrics - Compact Row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-2 bg-gray-50 rounded border text-center">
          <div className="text-xs text-gray-500 mb-1">Overall Risk</div>
          <div className="text-sm font-semibold text-amber-600">MEDIUM</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded border text-center">
          <div className="text-xs text-gray-500 mb-1">Rootedness</div>
          <div className="text-sm font-semibold text-green-600">84/100</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded border text-center">
          <div className="text-xs text-gray-500 mb-1">Intent Analysis</div>
          <div className="text-sm font-semibold text-purple-600">76/100</div>
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
      
      {/* Simplified Tabs */}
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
        
        <TabsContent value="recommendations" className="pt-3">
          <div className="space-y-2">
            {scanResult.recommendations.map((rec, index) => (
              <div key={index} className="p-2 bg-blue-50 border border-blue-100 rounded-md text-sm">
                <div className="flex">
                  <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{rec.message}</p>
                    <div className="flex mt-1">
                      <Badge variant="outline" className="text-xs bg-white">
                        {rec.actionType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="pt-3">
          <div className="space-y-3">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b">
                <h4 className="text-sm font-medium">Travel Pattern</h4>
              </div>
              <div className="p-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Previous Visas</p>
                  <p className="text-sm">3 in last 24 months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg. Stay</p>
                  <p className="text-sm">14 days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Return Rate</p>
                  <p className="text-sm">100%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Purpose</p>
                  <p className="text-sm">Tourism (3)</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b">
                <h4 className="text-sm font-medium">Document Consistency</h4>
              </div>
              <div className="p-2 space-y-1 text-sm">
                <div className="flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                  <p className="text-sm">Photo matches across documents</p>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                  <p className="text-sm">Minor name format variations</p>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                  <p className="text-sm">Address consistent throughout</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b">
                <h4 className="text-sm font-medium">Financial Assessment</h4>
              </div>
              <div className="p-2 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Required: £3,000</span>
                  <span className="text-xs text-green-600">Available: £5,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '166%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Fund Stability</p>
                    <p className="text-sm">3+ months</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="text-sm">Employment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
    
    <CardFooter className="border-t pt-3 text-xs">
      <div className="flex justify-between items-center w-full">
        <div className="text-gray-500">
          <span>AI Model: Visa Assessment v2.1</span>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Run Additional Checks
        </Button>
      </div>
    </CardFooter>
  </Card>
</div>

          {/* Main Application Sections */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <h2 className="text-lg font-medium mb-4">Identity & Background</h2>
              {leftColumnSections.map(section => (
                applicationData.sections[section.id] && (
                  <SectionCard 
                    key={section.id}
                    title={section.title}
                    icon={section.icon}
                    section={applicationData.sections[section.id]}
                    scanIssues={getIssuesForSection(section.id)}
                    onApprove={() => handleApproveSection(section.id)}
                    onRefer={() => handleReferSection(section.id)}
                    onAddNote={() => handleAddNote(section.id)}
                  />
                )
              ))}
            </div>

            {/* Right Column */}
            <div>
              <h2 className="text-lg font-medium mb-4">Eligibility & Travel</h2>
              {rightColumnSections.map(section => (
                applicationData.sections[section.id] && (
                  <SectionCard 
                    key={section.id}
                    title={section.title}
                    icon={section.icon}
                    section={applicationData.sections[section.id]}
                    scanIssues={getIssuesForSection(section.id)}
                    onApprove={() => handleApproveSection(section.id)}
                    onRefer={() => handleReferSection(section.id)}
                    onAddNote={() => handleAddNote(section.id)}
                  />
                )
              ))}
            </div>
          </div>

          {/* Final Decision Footer */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border sticky bottom-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Final Decision</h3>
                <p className="text-sm text-gray-500">
                  {Object.keys(decisions).length} of {Object.keys(applicationData.sections).length} sections reviewed
                </p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleFinalDecision('refer')}
                  disabled={!allSectionsDecided()}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Refer for Additional Review
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleFinalDecision('approve')}
                  disabled={!allSectionsDecided()}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={activeNoteSection !== null} onOpenChange={(open) => !open && setActiveNoteSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your notes here..."
              className="min-h-[150px]"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveNoteSection(null)}>Cancel</Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {finalDecision === 'approve' ? 'Confirm Approval' : 'Confirm Referral'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {finalDecision === 'approve' ? (
              <p>Are you sure you want to approve this application? This will move the application to the next stage in the processing workflow.</p>
            ) : (
              <p>Are you sure you want to refer this application for additional review? This will flag the application for a secondary review.</p>
            )}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button 
              onClick={submitFinalDecision}
              className={finalDecision === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              {finalDecision === 'approve' ? 'Confirm Approval' : 'Confirm Referral'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}