// Types for the Live Queue functionality

export interface ConsulateOfficial {
    id: string;
    name: string;
    avatar?: string;
    activeApplications: number;
    role?: string;
  }
  
  export interface LiveApplication {
    id: string;            // Application ID (e.g., 'CR8743084')
    applicantName: string; // Full name of applicant
    country: string;       // Country code (e.g., 'eg' for Egypt)
    visaType: string;      // Type of visa (e.g., 'Tourist, 30 Days')
    category?: string;     // Visa category (e.g., 'Business', 'Medical')
    submittedAt: string;   // Timestamp or relative time
    status: 'In Progress' | 'Approved' | 'Pending' | 'Rejected';
    assignedTo?: {
      id: string;
      name: string;
      avatar?: string;
    };
    flags?: string[];      // Any special flags or notes
  }
  
  export interface LiveQueueFilters {
    search: string;
    status: string[];
    visaType: string[];
    country: string[];
    dateRange?: {
      from: Date | null;
      to: Date | null;
    };
    assignedTo?: string[];
  }
  
  export interface LiveQueueStats {
    total: number;
    inProgress: number;
    approved: number;
    pending: number;
    rejected: number;
    unassigned: number;
  }