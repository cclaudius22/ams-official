// src/components/visa-builder/// src/components/visa-builder/interfaces.ts
import React from 'react';

export interface Stage {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>; // Icon is a component type
  enabled?: boolean;
  locked?: boolean;
  group: 'fixed' | 'conditional' | 'final';
  categories?: string[];
}

export interface DocumentType {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  purpose: string;
  format: string;
  examples: string[];
  categories?: string[];
}

export interface ProcessingTier {
  type: string;
  timeframe: string;
}

export interface VisaCost {
  amount: number;
  currency: string;
}

export interface ProcessingInfo {
  generalTimeframe: string;
  additionalInfo?: string;
}

export interface VisaMetadata {
  validityPeriod?: number;
  maxExtensions?: number;
}

export interface VisaConfig {
  name: string;
  typeId: string;
  description: string;
  code: string;
  category: string;
  eligibilityCriteria: string[];
  fixedStages: Stage[];
  conditionalStages: Stage[];
  finalStages: Stage[];
  documentTypes: DocumentType[];
  processingTiers: ProcessingTier[];
  visaCost: VisaCost;
  additionalCosts: AdditionalCost[];
  processingInfo: ProcessingInfo;
  metadata?: VisaMetadata;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface AdditionalCost {
  description: string;
  amount: number;
  currency: string;
}
