// src/components/visa-builder/AIScanConfigurator.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface AIScan {
  id: string;
  name: string;
  enabled: boolean;
}

interface AIScanConfiguratorProps {
  aiScans: AIScan[];
  toggleAIScan: (scanId: string) => void;
}

const AIScanConfigurator: React.FC<AIScanConfiguratorProps> = ({
  aiScans,
  toggleAIScan
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <ShieldCheck className="h-4 w-4 mr-2 text-purple-500" />
          Configure AI Scan Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Enable or disable AI validations that will be performed on submitted documents.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {aiScans.map((scan) => (
            <div
              key={scan.id}
              className={`border rounded-md p-3 flex items-center ${
                scan.enabled ? 'bg-purple-50' : 'bg-gray-50'
              }`}
            >
              <ShieldCheck className={`h-5 w-5 mr-2 ${
                scan.enabled ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <div>
                <p className="text-sm font-medium">{scan.name}</p>
                <p className="text-xs">
                  <span className={scan.enabled ? 'text-purple-500' : 'text-gray-500'}>
                    {scan.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => toggleAIScan(scan.id)}
              >
                {scan.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIScanConfigurator;