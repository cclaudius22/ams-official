// src/contexts/OfficerContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ConsulateOfficial } from '@/api-contracts/users';
import { defaultOfficers, getSpecializationDisplayName } from '@/data/seed/officers';

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface OfficerContextType {
  currentOfficer: ConsulateOfficial | null;
  setCurrentOfficer: (officer: ConsulateOfficial) => void;
  officers: ConsulateOfficial[];
  isLoading: boolean;
}

// ============================================================================
// CONTEXT & PROVIDER
// ============================================================================

const OfficerContext = createContext<OfficerContextType | undefined>(undefined);

const STORAGE_KEY = 'demo-selected-officer-id';

interface OfficerProviderProps {
  children: ReactNode;
}

export function OfficerProvider({ children }: OfficerProviderProps) {
  const [currentOfficer, setCurrentOfficerState] = useState<ConsulateOfficial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load officers and restore selection from localStorage on mount
  useEffect(() => {
    const savedOfficerId = localStorage.getItem(STORAGE_KEY);

    if (savedOfficerId) {
      const savedOfficer = defaultOfficers.find(o => o.id === savedOfficerId);
      if (savedOfficer) {
        setCurrentOfficerState(savedOfficer);
      } else {
        // Fallback to Rachel Johnson (Demo) if saved ID not found
        const demoOfficer = defaultOfficers.find(o => o.id === 'officer-demo');
        setCurrentOfficerState(demoOfficer || defaultOfficers[0]);
      }
    } else {
      // Default to Rachel Johnson (Demo) - she has hardcoded mock data
      const demoOfficer = defaultOfficers.find(o => o.id === 'officer-demo');
      setCurrentOfficerState(demoOfficer || defaultOfficers[0]);
    }

    setIsLoading(false);
  }, []);

  // Persist selection to localStorage
  const setCurrentOfficer = (officer: ConsulateOfficial) => {
    setCurrentOfficerState(officer);
    localStorage.setItem(STORAGE_KEY, officer.id);
  };

  return (
    <OfficerContext.Provider
      value={{
        currentOfficer,
        setCurrentOfficer,
        officers: defaultOfficers,
        isLoading,
      }}
    >
      {children}
    </OfficerContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useOfficer() {
  const context = useContext(OfficerContext);
  if (context === undefined) {
    throw new Error('useOfficer must be used within an OfficerProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get display name for officer role
 */
export function getRoleDisplayName(role: string): string {
  const names: Record<string, string> = {
    'super_admin': 'Super Admin',
    'senior_officer': 'Senior Officer',
    'officer': 'Officer',
    'specialist': 'Trainee',
    'viewer': 'Viewer',
  };
  return names[role] || role;
}

/**
 * Get officer's full name
 */
export function getOfficerFullName(officer: ConsulateOfficial): string {
  return `${officer.firstName} ${officer.lastName}`;
}

/**
 * Get officer's initials
 */
export function getOfficerInitials(officer: ConsulateOfficial): string {
  return `${officer.firstName.charAt(0)}${officer.lastName.charAt(0)}`;
}

/**
 * Get specializations as display string
 */
export function getSpecializationsDisplay(officer: ConsulateOfficial): string {
  if (!officer.specializations || officer.specializations.length === 0) {
    return 'General';
  }
  return officer.specializations
    .map(spec => getSpecializationDisplayName(spec))
    .join(', ');
}
