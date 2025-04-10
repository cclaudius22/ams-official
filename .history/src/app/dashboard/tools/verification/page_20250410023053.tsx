

"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Clock,
  BadgeAlert,
  BookX,
  Ban,
  GraduationCap,
  Gavel,
  Users,
  Image as ImageIcon
} from 'lucide-react';

export default function VerificationHub() {
  const [documentId, setDocumentId] = useState('');
  const [checkingSystem, setCheckingSystem] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [inputType, setInputType] = useState<'passport' | 'name' | 'photo'>('passport');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Extended systems array with all checks
  const systems = [
    {
      id: 'document',
      title: 'Document Check',
      desc: 'Passport Verification & MRZ',
      icon: FileSearch,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      inputType: 'passport'
    },
    {
      id: 'biometric',
      title: 'Biometric Match',
      desc: 'INTERPOL AFIS Integration',
      icon: Fingerprint,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      inputType: 'passport'
    },
    {
      id: 'interpol',
      title: 'INTERPOL',
      desc: 'Red Notices & Alerts',
      icon: Shield,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      inputType: 'passport'
    },
    {
      id: 'sanctions',
      title: 'Sanctions',
      desc: 'UN & EU Sanctions Lists',
      icon: Ban,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      inputType: 'passport'
    },
    {
      id: 'immigration',
      title: 'Immigration History',
      desc: 'Previous Refusals & Overstays',
      icon: BookX,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      inputType: 'passport'
    },
    {
      id: 'travel',
      title: 'Travel History',
      desc: 'Border Crossings & Duration',
      icon: Globe,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      inputType: 'passport'
    },
    {
      id: 'education',
      title: 'Education Verification',
      desc: 'Degree & Institution Validation',
      icon: GraduationCap,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-100',
      inputType: 'name'
    },
    {
      id: 'criminal',
      title: 'Criminal Records',
      desc: 'National Police Database Check',
      icon: Gavel,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-100',
      inputType: 'name'
    },
    {
      id: 'social',
      title: 'Social Media Screening',
      desc: 'Online Presence Analysis',
      icon: Users,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-100',
      inputType: 'photo'
    }
  ];

  // Run single system check
  const runSystemCheck = async (systemId: string) => {
    if (!documentId) return;
    
    setCheckingSystem(systemId);
    try {
      const result = await checkSystem(systemId, documentId);
      setResults(prev => ({
        ...prev,
        [systemId]: result
      }));
      
      // Show alert if serious issues found
      if (result.status === 'alert' || result.redNotice || result.listed) {
        setShowAlert(true);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [systemId]: { error: 'Check failed' }
      }));
    }
    setCheckingSystem(null);
  };

  // Run all checks in sequence
  const runAllChecks = async () => {
    if (!documentId) return;
    
    setResults({});
    setShowAlert(false);
    
    for (const system of systems) {
      await runSystemCheck(system.id);
    }
  };

  const formatResult = (result: any) => {
    if (!result) return null;
    
    if (result.error) return (
      <div className="text-red-600">Error: {result.error}</div>
    );

    return (
      <div className="space-y-2">
        {Object.entries(result).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-600">{key}:</span>
            <span className="font-medium">{
              typeof value === 'boolean' 
                ? value ? 'Yes' : 'No'
                : String(value)
            }</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Verification Hub</h1>
          <p className="text-gray-500">
            Test IDs: AB123456 (clean), CD789012 (alerts), XY789012 (sanctions)
          </p>
        </div>
      </div>

      {/* Search and Alert Section */}
      <div className="space-y-4 mb-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            {inputType === 'photo' ? (
              <div className="flex flex-col gap-4">
                {filePreview ? (
                  <div className="relative h-40 w-full rounded-lg border">
                    <img 
                      src={filePreview} 
                      alt="Upload preview"
                      className="h-full w-full object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFilePreview(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFilePreview(URL.createObjectURL(file));
                            setDocumentId(file.name);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="pl-9"
                    placeholder={
                      inputType === 'passport' 
                        ? 'Enter passport number...' 
                        : 'Enter full name and date of birth...'
                    }
                  />
                </div>
                <Button onClick={runAllChecks} disabled={!documentId || !!checkingSystem}>
                  {checkingSystem ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : 'Verify All'}
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant={inputType === 'passport' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setInputType('passport')}
              >
                <FileSearch className="h-4 w-4 mr-2" />
                Passport
              </Button>
              <Button 
                variant={inputType === 'name' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setInputType('name')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Name/DOB
              </Button>
              <Button 
                variant={inputType === 'photo' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setInputType('photo')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
        </Card>

        {showAlert && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Serious alerts detected. Check individual system results.
            </AlertDescription>
          </Alert>
        )}
      </div>

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
                  {formatResult(results[system.id])}
                </div>
              )}

              {/* Action Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => runSystemCheck(system.id)}
                disabled={!documentId || !!checkingSystem}
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

function SystemStatus({ isChecking, result }: { isChecking: boolean; result?: any }) {
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

  if (
    result.status === 'alert' || 
    result.redNotice || 
    result.listed || 
    (result.matches && result.matches.length > 0)
  ) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-700">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Alert
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-700">
      <CheckCircle className="h-3 w-3 mr-1" />
      Clear
    </Badge>
  );
}
