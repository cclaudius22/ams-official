// components/onboarding/ConfigurationManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Users,
  Building,
  Layers,
} from 'lucide-react';

// Services
import { getConfigurations, updateConfiguration } from '@/services/onboardingService';

// Sample data - replace with actual API call
const SAMPLE_CONFIGURATIONS = [
  {
    id: '1',
    name: 'Employee Onboarding',
    key: 'employee-onboarding',
    targetUserType: 'employee',
    targetOrgType: 'all',
    version: 1,
    isActive: true,
    steps: [
      { id: 's1', title: 'Personal Information', fields: [{ id: 'f1' }, { id: 'f2' }] },
      { id: 's2', title: 'Role Information', fields: [{ id: 'f3' }] },
      { id: 's3', title: 'Document Upload', fields: [{ id: 'f4' }, { id: 'f5' }] },
    ],
    createdBy: 'Admin User',
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2023-10-20'),
  },
  {
    id: '2',
    name: 'Admin Onboarding',
    key: 'admin-onboarding',
    targetUserType: 'admin',
    targetOrgType: 'government',
    version: 2,
    isActive: true,
    steps: [
      { id: 's1', title: 'Personal Information', fields: [{ id: 'f1' }, { id: 'f2' }] },
      { id: 's2', title: 'Security Information', fields: [{ id: 'f3' }] },
      { id: 's3', title: 'Access Level Setup', fields: [{ id: 'f4' }] },
    ],
    createdBy: 'Admin User',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15'),
  },
  {
    id: '3',
    name: 'Super Admin Onboarding',
    key: 'super-admin-onboarding',
    targetUserType: 'super-admin',
    targetOrgType: 'government',
    version: 1,
    isActive: false,
    steps: [
      { id: 's1', title: 'Personal Information', fields: [{ id: 'f1' }, { id: 'f2' }] },
      { id: 's2', title: 'Verification', fields: [{ id: 'f3' }] },
      { id: 's3', title: 'Security Clearance', fields: [{ id: 'f4' }] },
      { id: 's4', title: 'Role Setup', fields: [{ id: 'f5' }] },
    ],
    createdBy: 'Admin User',
    createdAt: new Date('2023-10-25'),
    updatedAt: new Date('2023-10-25'),
  },
];

export default function ConfigurationManagement() {
  const router = useRouter();
  const [configurations, setConfigurations] = useState(SAMPLE_CONFIGURATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Load configurations - in real app, would fetch from API
  useEffect(() => {
    const loadConfigurations = async () => {
      setLoading(true);
      try {
        // In a real app, this would be:
        // const configs = await getConfigurations();
        // setConfigurations(configs);
        setConfigurations(SAMPLE_CONFIGURATIONS);
      } catch (error) {
        console.error('Failed to load configurations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfigurations();
  }, []);

  // Filter configurations based on search term
  const filteredConfigurations = configurations.filter(
    (config) =>
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.targetUserType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle configuration active status
  const toggleActive = (id: string, isActive: boolean) => {
    setConfigurations((prev) =>
      prev.map((config) => {
        if (config.id === id) {
          return { ...config, isActive };
        }
        // If activating this configuration for a specific user/org type,
        // deactivate other configs for the same user/org type
        if (isActive) {
          const targetConfig = prev.find((c) => c.id === id);
          if (
            targetConfig &&
            config.id !== id &&
            config.targetUserType === targetConfig.targetUserType &&
            config.targetOrgType === targetConfig.targetOrgType &&
            config.isActive
          ) {
            return { ...config, isActive: false };
          }
        }
        return config;
      })
    );

    // In a real app, would update via API:
    // await updateConfiguration(id, { isActive });
  };

  // Get user type display
  const getUserTypeDisplay = (type: string) => {
    switch (type) {
      case 'employee':
        return 'Employee';
      case 'admin':
        return 'Administrator';
      case 'super-admin':
        return 'Super Admin';
      default:
        return type;
    }
  };

  // Get org type display
  const getOrgTypeDisplay = (type: string) => {
    switch (type) {
      case 'all':
        return 'All Organizations';
      case 'government':
        return 'Government';
      case 'enterprise':
        return 'Enterprise';
      case 'bank':
        return 'Banking';
      default:
        return type;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Onboarding Configurations</h1>
          <p className="text-muted-foreground">
            Manage onboarding flows for different user roles and organization types
          </p>
        </div>
        <Link href="/nexus-onboard/visual-configurator">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Configuration
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>All Configurations</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search configurations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Organization Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigurations.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    <div>
                      {config.name}
                      <div className="text-xs text-muted-foreground">{config.key}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {getUserTypeDisplay(config.targetUserType)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      {getOrgTypeDisplay(config.targetOrgType)}
                    </div>
                  </TableCell>
                  <TableCell>{config.version}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                      {config.steps.length} steps
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(config.updatedAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.isActive}
                        onCheckedChange={(checked) => toggleActive(config.id, checked)}
                      />
                      <span className={`text-sm ${config.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/nexus-onboard/visual-configurator?id=${config.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredConfigurations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Layers className="h-6 w-6" />
                      </div>
                      <p className="mb-1">No configurations found</p>
                      <p className="text-sm">
                        {searchTerm
                          ? `No results for "${searchTerm}"`
                          : 'Add your first configuration to get started'}
                      </p>
                      {!searchTerm && (
                        <Link href="/nexus-onboard/visual-configurator">
                          <Button className="mt-4" variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Configuration
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}