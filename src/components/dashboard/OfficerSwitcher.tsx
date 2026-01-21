// src/components/dashboard/OfficerSwitcher.tsx
'use client';

import React from 'react';
import { ChevronDown, User, Beaker } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useOfficer,
  getRoleDisplayName,
  getOfficerFullName,
  getOfficerInitials,
  getSpecializationsDisplay,
} from '@/contexts/OfficerContext';
import type { ConsulateOfficial } from '@/api-contracts/users';

export default function OfficerSwitcher() {
  const { currentOfficer, setCurrentOfficer, officers, isLoading } = useOfficer();

  if (isLoading || !currentOfficer) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 h-auto py-1.5 px-3 border-amber-200 bg-amber-50 hover:bg-amber-100"
        >
          {/* Demo Mode Indicator */}
          <div className="flex items-center space-x-1 text-amber-700">
            <Beaker className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Demo</span>
          </div>

          <div className="w-px h-4 bg-amber-200" />

          {/* Current Officer Info */}
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
              {getOfficerInitials(currentOfficer)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {getOfficerFullName(currentOfficer)}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center space-x-2 text-amber-700">
          <Beaker className="h-4 w-4" />
          <span>Demo Mode - Switch Officer</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {officers.map((officer) => (
          <DropdownMenuItem
            key={officer.id}
            onClick={() => setCurrentOfficer(officer)}
            className={`flex items-start space-x-3 p-3 cursor-pointer ${
              officer.id === currentOfficer.id ? 'bg-blue-50' : ''
            }`}
          >
            {/* Officer Avatar */}
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                officer.id === currentOfficer.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getOfficerInitials(officer)}
            </div>

            {/* Officer Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {getOfficerFullName(officer)}
                </span>
                {officer.id === currentOfficer.id && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  {getRoleDisplayName(officer.role)}
                </Badge>
                <span className="text-xs text-gray-500 truncate">
                  {getSpecializationsDisplay(officer)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {officer.activeApplications} active cases
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
