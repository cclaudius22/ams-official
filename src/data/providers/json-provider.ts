/**
 * JSON Data Provider
 * Loads synthetic application data from JSON files for development/demo
 */

import fs from 'fs/promises';
import path from 'path';

import type {
  ApplicationDataProvider,
  PaginationParams,
  PaginatedResponse,
  BulkAssignmentResult,
} from './index';

import type {
  LiveApplication,
  ApplicationDetail,
  ApplicationStatus,
  ApplicationFilters,
  LiveQueueStats,
  AIScanResult,
} from '@/api-contracts/applications';

import type { ConsulateOfficial } from '@/api-contracts/users';

import type { SyntheticApplication } from '../synthetic/types';
import {
  transformToLiveApplication,
  transformToApplicationDetail,
  generateScanResult,
} from '../synthetic/transformer';

import { defaultOfficers, getOfficersByVisaType } from '../seed/officers';

interface CachedApplication {
  raw: SyntheticApplication;
  live: LiveApplication;
  detail: ApplicationDetail;
  scanResult: AIScanResult;
}

export class JsonDataProvider implements ApplicationDataProvider {
  private syntheticDataPath: string;
  private applicationsCache: Map<string, CachedApplication> = new Map();
  private assignments: Map<string, string> = new Map(); // appId -> officerId
  private statusOverrides: Map<string, ApplicationStatus> = new Map();
  private initialized = false;

  constructor(syntheticDataPath: string) {
    this.syntheticDataPath = syntheticDataPath;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log(`[JsonProvider] Initializing with path: ${this.syntheticDataPath}`);

    try {
      const appsDir = path.join(process.cwd(), this.syntheticDataPath, 'applications');
      const files = await fs.readdir(appsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      console.log(`[JsonProvider] Found ${jsonFiles.length} application files`);

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(appsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const raw: SyntheticApplication = JSON.parse(content);

          const live = transformToLiveApplication(raw);
          const detail = transformToApplicationDetail(raw);
          const scanResult = generateScanResult(raw);

          this.applicationsCache.set(raw.application_id, {
            raw,
            live,
            detail,
            scanResult,
          });
        } catch (err) {
          console.error(`[JsonProvider] Failed to load ${file}:`, err);
        }
      }

      this.initialized = true;
      console.log(`[JsonProvider] Loaded ${this.applicationsCache.size} applications`);
    } catch (err) {
      console.error('[JsonProvider] Initialization failed:', err);
      throw err;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getApplications(
    filters: ApplicationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<LiveApplication>> {
    let applications = Array.from(this.applicationsCache.values()).map(cached => {
      const app = { ...cached.live };

      // Apply status overrides
      if (this.statusOverrides.has(app.id)) {
        app.status = this.statusOverrides.get(app.id)!;
      }

      // Apply assignment
      const officerId = this.assignments.get(app.id);
      if (officerId) {
        const officer = defaultOfficers.find(o => o.id === officerId);
        if (officer) {
          app.assignedTo = {
            id: officer.id,
            name: `${officer.firstName} ${officer.lastName}`,
          };
          // Update status if was pending assignment
          if (app.status === 'Pending Assignment') {
            app.status = 'In Progress';
          }
        }
      }

      return app;
    });

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      applications = applications.filter(
        app =>
          app.id.toLowerCase().includes(searchLower) ||
          app.applicantName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status.length > 0) {
      applications = applications.filter(app => filters.status!.includes(app.status));
    }

    if (filters.visaType && filters.visaType.length > 0) {
      applications = applications.filter(app =>
        filters.visaType!.some(vt =>
          app.visaType.toLowerCase().includes(vt.toLowerCase())
        )
      );
    }

    if (filters.country && filters.country.length > 0) {
      applications = applications.filter(app =>
        filters.country!.includes(app.country)
      );
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      applications = applications.filter(app =>
        app.assignedTo && filters.assignedTo!.includes(app.assignedTo.id)
      );
    }

    // Sort by submitted date (newest first)
    applications.sort((a, b) => {
      // Parse relative time back to compare (simplified)
      return 0; // Keep original order for now
    });

    const total = applications.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    const start = (pagination.page - 1) * pagination.pageSize;
    const paginatedData = applications.slice(start, start + pagination.pageSize);

    return {
      data: paginatedData,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages,
    };
  }

  async getApplicationById(id: string): Promise<ApplicationDetail | null> {
    const cached = this.applicationsCache.get(id);
    if (!cached) return null;

    const detail = { ...cached.detail };

    // Apply status override
    if (this.statusOverrides.has(id)) {
      detail.status = this.statusOverrides.get(id)!;
    }

    // Apply assignment
    const officerId = this.assignments.get(id);
    if (officerId) {
      const officer = defaultOfficers.find(o => o.id === officerId);
      if (officer) {
        detail.assignedTo = {
          id: officer.id,
          name: `${officer.firstName} ${officer.lastName}`,
        };
        if (detail.status === 'Pending Assignment') {
          detail.status = 'In Progress';
        }
      }
    }

    return detail;
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<boolean> {
    if (!this.applicationsCache.has(id)) return false;
    this.statusOverrides.set(id, status);
    return true;
  }

  async getQueueStats(): Promise<LiveQueueStats> {
    const apps = Array.from(this.applicationsCache.values()).map(cached => {
      let status = cached.live.status;
      if (this.statusOverrides.has(cached.live.id)) {
        status = this.statusOverrides.get(cached.live.id)!;
      }
      if (this.assignments.has(cached.live.id) && status === 'Pending Assignment') {
        status = 'In Progress';
      }
      return status;
    });

    return {
      total: apps.length,
      inProgress: apps.filter(s => s === 'In Progress').length,
      approved: apps.filter(s => s === 'Approved').length,
      pending: apps.filter(s => s === 'Pending').length,
      rejected: apps.filter(s => s === 'Rejected').length,
      escalated: apps.filter(s => s === 'Escalated').length,
      unassigned: apps.filter(s => s === 'Pending Assignment').length,
    };
  }

  async getScanResult(applicationId: string): Promise<AIScanResult | null> {
    const cached = this.applicationsCache.get(applicationId);
    return cached?.scanResult || null;
  }

  async getOfficers(): Promise<ConsulateOfficial[]> {
    // Update active application counts based on current assignments
    const assignmentCounts = new Map<string, number>();
    for (const officerId of this.assignments.values()) {
      assignmentCounts.set(officerId, (assignmentCounts.get(officerId) || 0) + 1);
    }

    return defaultOfficers.map(officer => ({
      ...officer,
      activeApplications: officer.activeApplications + (assignmentCounts.get(officer.id) || 0),
    }));
  }

  async getOfficersBySpecialization(visaType: string): Promise<ConsulateOfficial[]> {
    console.log(`[JsonProvider] getOfficersBySpecialization called with visaType: "${visaType}"`);

    const specialists = getOfficersByVisaType(visaType);
    console.log(`[JsonProvider] Found ${specialists.length} officers for "${visaType}":`,
      specialists.map(o => `${o.firstName} ${o.lastName}`));

    // Update active counts
    const assignmentCounts = new Map<string, number>();
    for (const officerId of this.assignments.values()) {
      assignmentCounts.set(officerId, (assignmentCounts.get(officerId) || 0) + 1);
    }

    return specialists.map(officer => ({
      ...officer,
      activeApplications: officer.activeApplications + (assignmentCounts.get(officer.id) || 0),
    }));
  }

  async getOfficerById(id: string): Promise<ConsulateOfficial | null> {
    return defaultOfficers.find(o => o.id === id) || null;
  }

  async assignApplication(
    applicationId: string,
    officerId: string,
    method: 'auto' | 'manual' = 'manual'
  ): Promise<boolean> {
    if (!this.applicationsCache.has(applicationId)) return false;

    const officer = defaultOfficers.find(o => o.id === officerId);
    if (!officer) return false;

    this.assignments.set(applicationId, officerId);

    // Add timeline event
    const cached = this.applicationsCache.get(applicationId)!;
    cached.detail.timeline.push({
      id: `timeline-assign-${Date.now()}`,
      type: 'assignment',
      description: `Assigned to ${officer.firstName} ${officer.lastName}`,
      userName: 'System',
      timestamp: new Date().toISOString(),
      metadata: {
        officerId,
        method,
      },
    });

    return true;
  }

  async bulkAssign(
    applicationIds: string[],
    officerId: string
  ): Promise<BulkAssignmentResult> {
    const results = await Promise.all(
      applicationIds.map(async appId => {
        const success = await this.assignApplication(appId, officerId);
        return {
          applicationId: appId,
          officerId,
          success,
          error: success ? undefined : 'Application or officer not found',
        };
      })
    );

    return {
      total: applicationIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  async unassignApplication(applicationId: string): Promise<boolean> {
    if (!this.assignments.has(applicationId)) return false;
    this.assignments.delete(applicationId);
    this.statusOverrides.set(applicationId, 'Pending Assignment');
    return true;
  }
}
