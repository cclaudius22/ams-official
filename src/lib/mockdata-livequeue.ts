import { LiveApplication, ConsulateOfficial } from '@/types/liveQueue';

export const mockOfficials: ConsulateOfficial[] = [
  {
    id: 'official1',
    name: 'Uma Mirza',
    activeApplications: 30,
    role: 'Senior Visa Officer'
  },
  {
    id: 'official2',
    name: 'Ricardo Martinez',
    activeApplications: 43,
    role: 'Visa Officer'
  },
  {
    id: 'official3',
    name: 'Ken Scott',
    activeApplications: 45,
    role: 'Visa Officer'
  },
  {
    id: 'official4',
    name: 'Marie Lovett',
    activeApplications: 30,
    role: 'Visa Officer'
  },
  {
    id: 'official5',
    name: 'Kerry Henderson',
    activeApplications: 30,
    role: 'Senior Visa Officer'
  },
  {
    id: 'official6',
    name: 'Belinda O\'Reilly',
    activeApplications: 30,
    role: 'Visa Officer'
  },
  {
    id: 'official7',
    name: 'Evica Key',
    activeApplications: 15,
    role: 'Trainee Officer'
  }
];

export const mockLiveQueue: LiveApplication[] = [
  {
    id: 'CR8743084',
    applicantName: 'Ahmed Buscemi',
    country: 'eg',
    visaType: 'Tourist, 30 Days',
    submittedAt: 'Just now',
    status: 'In Progress',
    assignedTo: {
      id: 'official1',
      name: 'Uma Mirza'
    }
  },
  {
    id: 'CR8743320',
    applicantName: 'Carla Martinez',
    country: 'ca',
    visaType: 'Business',
    submittedAt: '1 minute ago',
    status: 'Approved',
    assignedTo: {
      id: 'official7',
      name: 'Evica Key'
    }
  },
  {
    id: 'CR8743301',
    applicantName: 'Aneta Andruszczyk',
    country: 'pl',
    visaType: 'Work, Migrant',
    submittedAt: '5 minutes ago',
    status: 'Pending',
    assignedTo: {
      id: 'official2',
      name: 'Ricardo Martinez'
    }
  },
  {
    id: 'CR7892787',
    applicantName: 'Loren Goodeves',
    country: 'gb',
    visaType: 'Medical',
    submittedAt: '10 minutes ago',
    status: 'Approved',
    assignedTo: {
      id: 'official3',
      name: 'Ken Scott'
    }
  },
  {
    id: 'CR7847888',
    applicantName: 'Sue Shon',
    country: 'cn',
    visaType: 'Student',
    category: 'Type C',
    submittedAt: '10 mins ago',
    status: 'Rejected',
    assignedTo: {
      id: 'official4',
      name: 'Marie Lovett'
    }
  },
  {
    id: 'CR8921873',
    applicantName: 'Raghav Srivastav',
    country: 'in',
    visaType: 'Business',
    category: 'Type C',
    submittedAt: '20 mins ago',
    status: 'In Progress',
    assignedTo: {
      id: 'official1',
      name: 'Uma Mirza'
    }
  },
  {
    id: 'CR8743343',
    applicantName: 'Stavros Georgiou',
    country: 'gr',
    visaType: 'Religious',
    submittedAt: '30 mins ago',
    status: 'Approved',
    assignedTo: {
      id: 'official5',
      name: 'Kerry Henderson'
    }
  },
  {
    id: 'CR8331435',
    applicantName: 'Edmund Chung',
    country: 'hk',
    visaType: 'Student',
    submittedAt: '1 hours ago',
    status: 'Approved',
    assignedTo: {
      id: 'official2',
      name: 'Ricardo Martinez'
    }
  },
  {
    id: 'CR8742655',
    applicantName: 'Pearl Mathanukul',
    country: 'th',
    visaType: 'Family, Spouse',
    submittedAt: '1 hours ago',
    status: 'Approved',
    assignedTo: {
      id: 'official3',
      name: 'Ken Scott'
    }
  },
  // Additional mock data for pagination testing
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `CRX${1000000 + i}`,
    applicantName: `Test Applicant ${i + 1}`,
    country: ['us', 'gb', 'ca', 'au', 'fr', 'de', 'jp', 'cn', 'in', 'br'][i % 10],
    visaType: ['Tourist', 'Business', 'Student', 'Work', 'Family'][i % 5],
    category: i % 2 === 0 ? 'Type C' : undefined,
    submittedAt: `${Math.floor(i / 2) + 2} hours ago`,
    status: ['In Progress', 'Approved', 'Pending', 'Rejected'][i % 4] as any,
    assignedTo: i % 3 === 0 ? undefined : {
      id: mockOfficials[i % mockOfficials.length].id,
      name: mockOfficials[i % mockOfficials.length].name
    }
  }))
];

// Helper function to calculate statistics based on the current queue
export const calculateQueueStats = (applications: LiveApplication[]) => {
  return {
    total: applications.length,
    inProgress: applications.filter(app => app.status === 'In Progress').length,
    approved: applications.filter(app => app.status === 'Approved').length,
    pending: applications.filter(app => app.status === 'Pending').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
    unassigned: applications.filter(app => !app.assignedTo).length
  };
};