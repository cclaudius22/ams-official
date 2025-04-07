'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  MoreHorizontal
} from 'lucide-react'

// Types
interface ApplicationReview {
  id: string
  applicant: string
  riskScore: number
  slaRemaining: string
  aiRecommendation: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'pending' | 'completed' | 'escalated'
  flags: string[]
  team: {
    background: string
    identity: string
    document: string
  }
  lastUpdated: string
  documents: string[]
  type: string
  country: string
}

// Mock Data
const mockReviews: ApplicationReview[] = [
  {
    id: '#UK-2024-1835',
    applicant: 'Robert Chen',
    riskScore: 78,
    slaRemaining: '4h 30m',
    aiRecommendation: 'Manual Review',
    priority: 'high',
    status: 'active',
    flags: ['Background Check Required', 'Multiple Applications'],
    team: {
      background: 'Sarah Johnson',
      identity: 'Uma Khan',
      document: 'Justin Time'
    },
    lastUpdated: '2 hours ago',
    documents: ['Passport', 'Bank Statements', 'Employment Letter'],
    type: 'Business Visa',
    country: 'Cambodia'
  },
  {
    id: '#UK-2024-1836',
    applicant: 'Emma Thompson',
    riskScore: 45,
    slaRemaining: '6h 15m',
    aiRecommendation: 'Approve',
    priority: 'high',
    status: 'active',
    flags: ['First Time Applicant'],
    team: {
      background: 'Sarah Johnson',
      identity: 'Mike Fitzgerald',
      document: 'Alex Mckenna'
    },
    lastUpdated: '1 hour ago',
    documents: ['Passport', 'Financial Documents'],
    type: 'Tourist Visa',
    country: 'Australia'
  }
]

export default function OfficerDashboard() {
  const [availableForTasks, setAvailableForTasks] = useState(true)
  const [selectedTab, setSelectedTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')

  const getFilteredReviews = (status: string) => {
    return mockReviews.filter(review => 
      review.status === status &&
      (searchQuery === '' || 
       review.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
       review.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const ReviewCard = ({ review }: { review: ApplicationReview }) => (
    <Card className={`mb-4 border-l-4 ${
      review.priority === 'high' ? 'border-l-red-500' : 
      review.priority === 'medium' ? 'border-l-orange-500' : 
      'border-l-blue-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-medium text-lg">{review.id}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                review.priority === 'high' ? 'bg-red-100 text-red-800' :
                review.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {review.priority.charAt(0).toUpperCase() + review.priority.slice(1)} Priority
              </span>
              {review.flags.map((flag, index) => (
                <span key={index} className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {flag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-6 mt-4">
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium">{review.applicant}</p>
                <p className="text-xs text-gray-500">{review.type} • {review.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Risk Score</p>
                <p className={`font-medium ${
                  review.riskScore > 70 ? 'text-red-600' :
                  review.riskScore > 40 ? 'text-green-600' :
                  'text-green-600'
                }`}>
                  {review.riskScore > 70 ? 'High' :
                   review.riskScore > 40 ? 'Low' :
                   'Low'} ({review.riskScore}/100)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SLA Remaining</p>
                <p className={`font-medium ${
                  review.slaRemaining.includes('4h') ? 'text-orange-600' :
                  'text-green-600'
                }`}>{review.slaRemaining}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">AI Recommendation</p>
                <p className="font-medium">{review.aiRecommendation}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Review Team</h4>
                <p className="text-xs text-gray-500">Last updated {review.lastUpdated}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Background: {review.team.background}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fingerprint className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Identity: {review.team.identity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Document: {review.team.document}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Documents:</span>
              {review.documents.map((doc, index) => (
                <span key={index} className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {doc}{index < review.documents.length - 1 ? ',' : ''} 
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Download Documents
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Request Additional Docs
          </button>
          <button className="px-4 py-2 border rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
            Escalate
          </button>
          <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
            Start Review
          </button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
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
       {/* Top Navigation Bar buttons */}
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
  <button 
    className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
      availableForTasks 
        ? 'bg-green-50 text-green-700' 
        : 'bg-gray-50 text-gray-700'
    }`}
    onClick={() => setAvailableForTasks(!availableForTasks)}
  >
    {availableForTasks ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <XCircle className="h-4 w-4" />
    )}
    <span>
      {availableForTasks ? 'Available for Tasks' : 'Not Available'}
    </span>
  </button>
</div>

        <div className="p-6">
          {/* Priority Alerts */}
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>SLA Breach Alert</AlertTitle>
            <AlertDescription>
              3 applications approaching SLA breach in the next 2 hours
            </AlertDescription>
          </Alert>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's Tasks</p>
                    <p className="text-2xl font-bold">15/20</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-green-600">On Track</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">SLA Status</p>
                    <p className="text-2xl font-bold text-green-500">97%</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-green-600">Within Target</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">High Priority</p>
                    <p className="text-2xl font-bold text-orange-500">4</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-orange-600">Needs Attention</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Accuracy Rate</p>
                    <p className="text-2xl font-bold">99.2%</p>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-purple-600">Last 30 Days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">Active Reviews</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pending Reviews</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
              <TabsTrigger value="escalated" className="flex-1">Escalated Cases</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {getFilteredReviews('active').map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Pending reviews will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Completed reviews will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="escalated">
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Escalated cases will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}