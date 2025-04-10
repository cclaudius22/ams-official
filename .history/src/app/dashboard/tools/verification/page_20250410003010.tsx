// app/dashboard/tools/verification/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Shield,
  Fingerprint,
  FileSearch,
  Globe,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Mock data for systems
const mockSystems = [
  {
    id: 'biometric',
    title: 'Biometric Check',
    desc: 'INTERPOL AFIS Integration',
    icon: Fingerprint,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    status: 'connected'
  },
  {
    id: 'document',
    title: 'Document Authentication',
    desc: 'Edison TD & PRADO',
    icon: FileSearch,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    status: 'connected'
  },
  {
    id: 'watchlist',
    title: 'Watch Lists',
    desc: 'International Security Database',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    status: 'verifying'
  },
  {
    id: 'travel',
    title: 'Travel History',
    desc: 'Global Entry & Exit Records',
    icon: Globe,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    status: 'error'
  }
];

export default function VerificationHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleSystemCheck = (systemId: string) => {
    setVerifyingId(systemId);
    // Will add verification logic here
    setTimeout(() => setVerifyingId(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Verification Hub</h1>
          <p className="text-gray-500">Centralized verification and security checks</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sync Systems
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              placeholder="Enter Applicant ID or Passport Number..."
            />
          </div>
          <Button>Verify All</Button>
        </div>
      </Card>

      {/* System Status Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Systems</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSystems.map((system) => (
          <Card key={system.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${system.bgColor}`}>
                  <system.icon className={`h-6 w-6 ${system.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{system.title}</h3>
                  <p className="text-sm text-gray-500">{system.desc}</p>
                </div>
              </div>
              <StatusBadge status={system.status} />
            </div>

            <SystemAction 
              status={system.status}
              isVerifying={verifyingId === system.id}
              onAction={() => handleSystemCheck(system.id)}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper Components
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'connected':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 gap-1">
          <CheckCircle className="h-3 w-3" /> Connected
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 gap-1">
          <XCircle className="h-3 w-3" /> Error
        </Badge>
      );
    case 'verifying':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" /> Verifying
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 gap-1">
          <Clock className="h-3 w-3" /> Maintenance
        </Badge>
      );
  }
}

function SystemAction({ 
  status, 
  isVerifying, 
  onAction 
}: { 
  status: string;
  isVerifying: boolean;
  onAction: () => void;
}) {
  if (status === 'connected') {
    return (
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={onAction}
        disabled={isVerifying}
      >
        Run Check
      </Button>
    );
  }

  if (status === 'error') {
    return (
      <Button 
        variant="outline" 
        className="w-full text-red-600 border-red-200 hover:bg-red-50" 
        onClick={onAction}
      >
        Retry
      </Button>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 w-2/3 animate-pulse" />
      </div>
    );
  }

  return (
    <Button variant="outline" className="w-full" disabled>
      Unavailable
    </Button>
  );
}