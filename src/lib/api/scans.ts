// lib/api/scans.ts
import { AIScanResult } from '@/types/aiScan';

// Mock data for development
const mockScanResult: AIScanResult = {
  status: 'completed',
  scanStartedAt: new Date('2025-03-25T14:30:00Z'),
  scanCompletedAt: new Date('2025-03-25T14:32:15Z'),
  isValid: false,
  rootednessScore: 84,
  intentScore: 76,
  issues: [
    {
      id: 'suspicious-travel-pattern',
      sectionId: 'travel',
      type: 'suspicious',
      severity: 'medium',
      message: 'Multiple short tourism trips detected - may require additional scrutiny',
    },
    {
      id: 'inconsistent-name-professional',
      sectionId: 'professional',
      fieldId: 'fullName',
      type: 'inconsistent',
      severity: 'medium',
      message: 'Name in professional section does not match passport',
      context: {
        passportName: 'john james doe',
        professionalName: 'john j. doe',
      }
    }
  ],
  recommendations: [
    {
      id: 'check-name-consistency',
      relatedIssueIds: ['inconsistent-name-professional'],
      message: 'Verify name consistency across all documents',
      actionType: 'verify',
    },
    {
      id: 'verify-travel-history',
      relatedIssueIds: ['suspicious-travel-pattern'],
      message: 'Review travel history for patterns',
      actionType: 'verify',
    }
  ],
  score: 78
};

export async function getAIScanResult(applicationId: string, useMock = false): Promise<AIScanResult> {
  // For development mode or testing
  if (useMock) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockScanResult;
  }
  
  // For production mode with real API
  try {
    const response = await fetch(`/api/applications/${applicationId}/scan`);
    if (!response.ok) throw new Error('Failed to fetch scan result');
    return await response.json();
  } catch (error) {
    console.error('Error fetching AI scan:', error);
    throw error;
  }
}

export async function triggerNewScan(applicationId: string): Promise<{ success: boolean, scanId?: string }> {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, scanId: 'mock-scan-' + Date.now() };
  }
  
  // Real API call
  try {
    const response = await fetch(`/api/applications/${applicationId}/scan/trigger`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to trigger new scan');
    return await response.json();
  } catch (error) {
    console.error('Error triggering new scan:', error);
    throw error;
  }
}