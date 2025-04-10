// app/dashboard/tools/verification/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { checkSystem } from '@/lib/mockSystems';
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

export default function VerificationHub() {
  const [documentId, setDocumentId] = useState('');
  const [checkingSystem, setCheckingSystem] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  // Systems we want to check
  const systems = [
    {
      id: 'document',
      title: 'Document Check',
      desc: 'Passport Verification',
      icon: FileSearch,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'watchlist',
      title: 'Watch Lists',
      desc: 'Security Database Check',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 'travel',
      title: 'Travel History',
      desc: 'Border Crossings',
      icon: Globe,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  // Check a single system
  const runSystemCheck = async (systemId: string) => {
    if (!documentId) return;
    
    setCheckingSystem(systemId);
    try {
      const result = await checkSystem(systemId, documentId);
      setResults(prev => ({
        ...prev,
        [systemId]: result
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [systemId]: { error: 'Check failed' }
      }));
    }
    setCheckingSystem(null);
  };

  // Check all systems
  const runAllChecks = async () => {
    if (!documentId) return;
    
    setResults({});
    for (const system of systems) {
      await runSystemCheck(system.id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Verification Hub</h1>
          <p className="text-gray-500">
            Test IDs: AB123456 (clean) or CD789012 (flagged)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="pl-9"
              placeholder="Enter test passport number..."
            />
          </div>
          <Button onClick={runAllChecks} disabled={!documentId}>
            Verify All
          </Button>
        </div>
      </Card>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.map((system) => (
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
              <SystemStatus 
                isChecking={checkingSystem === system.id}
                result={results[system.id]}
              />
            </div>

            <div className="space-y-3">
              {/* Results Display */}
              {results[system.id] && !checkingSystem && (
                <div className="text-sm bg-gray-50 rounded-lg p-3">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(results[system.id], null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => runSystemCheck(system.id)}
                disabled={!documentId || checkingSystem === system.id}
              >
                {checkingSystem === system.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : 'Run Check'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SystemStatus({ 
  isChecking, 
  result 
}: { 
  isChecking: boolean;
  result?: any;
}) {
  if (isChecking) {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-700">
        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
        Checking
      </Badge>
    );
  }

  if (!result) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        Ready
      </Badge>
    );
  }

  if (result.error) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-700">
        <XCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    );
  }

  if (result.status === 'alert' || result.status === 'ALERT') {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Alert
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-700">
      <CheckCircle className="h-3 w-3 mr-1" />
      Complete
    </Badge>
  );
}