/**
 * Data Provider Interface
 * Abstracts data access to allow switching between JSON files and database
 */

import type {
  LiveApplication,
  ApplicationDetail,
  ApplicationStatus,
  ApplicationFilters,
  LiveQueueStats,
  AIScanResult,
} from '@/api-contracts/applications';

import type { ConsulateOfficial } from '@/api-contracts/users';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssignmentResult {
  applicationId: string;
  officerId: string;
  success: boolean;
  error?: string;
}

export interface BulkAssignmentResult {
  total: number;
  successful: number;
  failed: number;
  results: AssignmentResult[];
}

export interface AssignmentSuggestion {
  suggestedOfficer: ConsulateOfficial;
  reason: string;
  alternatives: ConsulateOfficial[];
  confidence: number;
}

/**
 * Main data provider interface
 * Implemented by JSONProvider (dev) and PrismaProvider (production)
 */
export interface ApplicationDataProvider {
  // Initialization
  initialize(): Promise<void>;
  isInitialized(): boolean;

  // Application operations
  getApplications(
    filters: ApplicationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<LiveApplication>>;

  getApplicationById(id: string): Promise<ApplicationDetail | null>;

  updateApplicationStatus(id: string, status: ApplicationStatus): Promise<boolean>;

  getQueueStats(): Promise<LiveQueueStats>;

  getScanResult(applicationId: string): Promise<AIScanResult | null>;

  // Officer operations
  getOfficers(): Promise<ConsulateOfficial[]>;

  getOfficersBySpecialization(visaType: string): Promise<ConsulateOfficial[]>;

  getOfficerById(id: string): Promise<ConsulateOfficial | null>;

  // Assignment operations
  assignApplication(
    applicationId: string,
    officerId: string,
    method?: 'auto' | 'manual'
  ): Promise<boolean>;

  bulkAssign(
    applicationIds: string[],
    officerId: string
  ): Promise<BulkAssignmentResult>;

  unassignApplication(applicationId: string): Promise<boolean>;
}

// Singleton provider instance
let providerInstance: ApplicationDataProvider | null = null;

/**
 * Get the current data provider instance
 */
export async function getDataProvider(): Promise<ApplicationDataProvider> {
  if (!providerInstance) {
    // Dynamically import based on environment
    const providerType = process.env.DATA_PROVIDER || 'json';

    if (providerType === 'json') {
      const { JsonDataProvider } = await import('./json-provider');
      const syntheticPath = process.env.SYNTHETIC_DATA_PATH || '../openvisa-synthetic-data/output_demo';
      providerInstance = new JsonDataProvider(syntheticPath);
    } else {
      // Future: Prisma provider
      throw new Error(`Unknown data provider: ${providerType}`);
    }

    await providerInstance.initialize();
  }

  return providerInstance;
}

/**
 * Reset the provider (for testing)
 */
export function resetProvider(): void {
  providerInstance = null;
}
