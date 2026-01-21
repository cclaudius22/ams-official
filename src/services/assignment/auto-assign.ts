/**
 * Auto-Assignment Engine
 * Suggests the best officer for an application based on specialization and workload
 */

import type { ConsulateOfficial } from '@/api-contracts/users';
import type { ApplicationDetail } from '@/api-contracts/applications';
import type { AssignmentSuggestion, ApplicationDataProvider } from '@/data/providers';

/**
 * Calculate assignment score for an officer
 * Higher score = better match
 */
function calculateAssignmentScore(
  officer: ConsulateOfficial,
  visaType: string
): number {
  let score = 50; // Base score

  // Specialization match bonus (+30 points)
  if (officer.specializations?.includes(visaType)) {
    score += 30;
  }

  // Workload factor (lower is better, up to -20 points)
  const maxWorkload = 50;
  const workloadRatio = Math.min(officer.activeApplications / maxWorkload, 1);
  score -= workloadRatio * 20;

  // SLA compliance bonus (up to +15 points)
  score += (officer.slaCompliance / 100) * 15;

  // Processing time factor (faster is better, up to +10 points)
  const maxProcessingTime = 60; // minutes
  const processingRatio = Math.min(officer.avgProcessingTime / maxProcessingTime, 1);
  score += (1 - processingRatio) * 10;

  // Completed today bonus (shows activity, +5 points)
  if (officer.completedToday > 0) {
    score += 5;
  }

  // Trainee penalty (prefer experienced officers, -10 points)
  if (officer.role === 'specialist' && officer.specializations?.length === 0) {
    score -= 10;
  }

  // Senior officer bonus for complex visas (+5 points)
  const complexVisas = ['global_talent_visa', 'innovator_founder_visa'];
  if (officer.role === 'senior_officer' && complexVisas.includes(visaType)) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get reason string for assignment suggestion
 */
function getAssignmentReason(
  officer: ConsulateOfficial,
  visaType: string,
  score: number
): string {
  const reasons: string[] = [];

  if (officer.specializations?.includes(visaType)) {
    reasons.push('Specializes in this visa type');
  }

  if (officer.slaCompliance >= 95) {
    reasons.push('Excellent SLA compliance');
  }

  if (officer.activeApplications < 15) {
    reasons.push('Low current workload');
  }

  if (officer.role === 'senior_officer') {
    reasons.push('Senior officer');
  }

  if (reasons.length === 0) {
    reasons.push('Available for assignment');
  }

  return reasons.join('. ');
}

/**
 * Suggest the best officer for an application
 */
export async function suggestOfficerForApplication(
  applicationId: string,
  provider: ApplicationDataProvider
): Promise<AssignmentSuggestion> {
  console.log(`[Auto-Assign] Processing application: ${applicationId}`);

  // Get the application to determine visa type
  const application = await provider.getApplicationById(applicationId);
  if (!application) {
    console.error(`[Auto-Assign] Application not found: ${applicationId}`);
    throw new Error('Application not found');
  }

  const visaType = application.visaTypeId;
  console.log(`[Auto-Assign] Application ${applicationId} has visaTypeId: "${visaType}"`);

  if (!visaType) {
    console.error(`[Auto-Assign] Application ${applicationId} has no visaTypeId! Application:`, {
      id: application.id,
      visaType: application.visaType,
      status: application.status,
    });
    throw new Error(`Application ${applicationId} has no visaTypeId`);
  }

  // Get officers who specialize in this visa type
  let candidates = await provider.getOfficersBySpecialization(visaType);
  console.log(`[Auto-Assign] Found ${candidates.length} specialists for visa type "${visaType}"`);

  // If no specialists, fall back to all officers
  if (candidates.length === 0) {
    console.log(`[Auto-Assign] No specialists found, falling back to all officers`);
    candidates = await provider.getOfficers();
    console.log(`[Auto-Assign] Got ${candidates.length} total officers`);
  }

  // Filter to only available officers
  const activeCount = candidates.filter(o => o.isActive).length;
  console.log(`[Auto-Assign] ${activeCount} of ${candidates.length} candidates are active`);
  candidates = candidates.filter(o => o.isActive);

  if (candidates.length === 0) {
    console.error(`[Auto-Assign] No available officers for application ${applicationId}`);
    throw new Error('No available officers');
  }

  // Log candidate details
  console.log(`[Auto-Assign] Scoring ${candidates.length} candidates:`,
    candidates.map(o => `${o.firstName} ${o.lastName} (${o.specializations?.join(', ') || 'none'})`));

  // Score and rank candidates
  const scoredCandidates = candidates.map(officer => ({
    officer,
    score: calculateAssignmentScore(officer, visaType),
  }));

  // Sort by score (highest first)
  scoredCandidates.sort((a, b) => b.score - a.score);

  const best = scoredCandidates[0];
  const alternatives = scoredCandidates.slice(1, 4).map(s => s.officer);

  console.log(`[Auto-Assign] Selected ${best.officer.firstName} ${best.officer.lastName} with score ${best.score} for app ${applicationId}`);

  return {
    suggestedOfficer: best.officer,
    reason: getAssignmentReason(best.officer, visaType, best.score),
    alternatives,
    confidence: best.score / 100,
  };
}

/**
 * Suggest officers for multiple applications
 */
export async function suggestOfficersForBatch(
  applicationIds: string[],
  provider: ApplicationDataProvider
): Promise<Map<string, AssignmentSuggestion>> {
  const suggestions = new Map<string, AssignmentSuggestion>();

  for (const appId of applicationIds) {
    try {
      const suggestion = await suggestOfficerForApplication(appId, provider);
      suggestions.set(appId, suggestion);
    } catch (err) {
      console.error(`Failed to suggest officer for ${appId}:`, err);
    }
  }

  return suggestions;
}
