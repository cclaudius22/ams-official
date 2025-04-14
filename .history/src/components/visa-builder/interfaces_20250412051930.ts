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

export interface AdditionalCost {
  description: string;
  amount: string|number;
  currency: string;
}
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
