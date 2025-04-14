// services/onboardingService.ts

import { 
  OnboardingConfiguration, 
  OnboardingSession
} from '@/types/onboarding';

// Base API URL - adjust based on your environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/onboarding';

/**
 * Fetch all configurations
 */
export async function getConfigurations(): Promise<OnboardingConfiguration[]> {
  const response = await fetch(`${API_BASE_URL}/configurations`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch configurations: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch a single configuration by ID
 */
export async function getConfiguration(id: string): Promise<OnboardingConfiguration> {
  const response = await fetch(`${API_BASE_URL}/configurations/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch configuration: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch the active configuration for a given user type and org type
 */
export async function getActiveConfiguration(userType: string, orgType?: string): Promise<OnboardingConfiguration> {
  const url = orgType 
    ? `${API_BASE_URL}/configurations/active?userType=${userType}&orgType=${orgType}`
    : `${API_BASE_URL}/configurations/active?userType=${userType}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch active configuration: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Create a new configuration
 */
export async function createConfiguration(config: Partial<OnboardingConfiguration>): Promise<OnboardingConfiguration> {
  const response = await fetch(`${API_BASE_URL}/configurations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create configuration: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Update an existing configuration
 */
export async function updateConfiguration(id: string, config: Partial<OnboardingConfiguration>): Promise<OnboardingConfiguration> {
  const response = await fetch(`${API_BASE_URL}/configurations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update configuration: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Delete a configuration
 */
export async function deleteConfiguration(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/configurations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete configuration: ${response.status}`);
  }
}

/**
 * Create a new onboarding session
 */
export async function createSession(officialId: string, configId?: string): Promise<OnboardingSession> {
  const payload = configId ? { officialId, configId } : { officialId };
  
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get an onboarding session by ID
 */
export async function getSession(sessionId: string): Promise<OnboardingSession> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Update an onboarding session (save progress)
 */
export async function updateSession(
  sessionId: string, 
  data: { formData?: any; currentStep?: number }
): Promise<OnboardingSession> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update session: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Submit an onboarding session
 */
export async function submitSession(sessionId: string): Promise<OnboardingSession> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/submit`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to submit session: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get onboarding sessions for an official
 */
export async function getOfficialSessions(officialId: string): Promise<OnboardingSession[]> {
  const response = await fetch(`${API_BASE_URL}/sessions?officialId=${officialId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Handle API errors with more detailed information
 */
export class OnboardingApiError extends Error {
  status: number;
  details?: any;
  
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'OnboardingApiError';
    this.status = status;
    this.details = details;
  }
}