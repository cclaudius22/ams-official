// src/lib/mockdata-messages.ts

export interface MessageSender {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export interface Message {
  id: string;
  sender: MessageSender;
  subject?: string;
  body: string;
  timestamp: string;
  read: boolean;
  attachments?: {
    name: string;
    url: string;
    size: string;
  }[];
}

export interface MessageThread {
  id: string;
  participants: MessageSender[];
  subject: string;
  lastMessageTimestamp: string;
  lastMessageSnippet: string;
  unreadCount: number;
  category: string; // 'Inbox', 'Sent', 'Drafts', 'InMail', 'Applications'
  messages: Message[];
}

// Mock data for message threads
export const mockMessageThreads: MessageThread[] = [
  {
    id: 'thread-1',
    participants: [
      {
        id: 'user-1',
        name: 'John Doe',
        role: 'Applicant',
        avatarUrl: null
      }
    ],
    subject: 'Question about my visa application',
    lastMessageTimestamp: '2025-10-03T14:30:00Z',
    lastMessageSnippet: 'I have a question about the financial requirements for my visa application...',
    unreadCount: 1,
    category: 'Inbox',
    messages: [
      {
        id: 'msg-1',
        sender: {
          id: 'user-1',
          name: 'John Doe',
          role: 'Applicant',
          avatarUrl: null
        },
        subject: 'Question about my visa application',
        body: 'Hello,\n\nI have a question about the financial requirements for my visa application. The guidelines state that I need to show proof of funds for the duration of my stay, but I\'m not sure what documents are acceptable.\n\nCan you please clarify what financial documents I need to provide?\n\nThank you,\nJohn Doe',
        timestamp: '2025-10-03T14:30:00Z',
        read: false
      }
    ]
  },
  {
    id: 'thread-2',
    participants: [
      {
        id: 'user-2',
        name: 'Emma Wilson',
        role: 'Applicant',
        avatarUrl: null
      }
    ],
    subject: 'Missing document in my application',
    lastMessageTimestamp: '2025-10-03T10:15:00Z',
    lastMessageSnippet: 'I noticed that I forgot to upload my bank statement in my application...',
    unreadCount: 0,
    category: 'Inbox',
    messages: [
      {
        id: 'msg-2',
        sender: {
          id: 'user-2',
          name: 'Emma Wilson',
          role: 'Applicant',
          avatarUrl: null
        },
        subject: 'Missing document in my application',
        body: 'Dear Visa Officer,\n\nI noticed that I forgot to upload my bank statement in my application. I have attached it to this message.\n\nPlease let me know if you need any other documents.\n\nBest regards,\nEmma Wilson',
        timestamp: '2025-10-03T10:15:00Z',
        read: true,
        attachments: [
          {
            name: 'bank_statement.pdf',
            url: '#',
            size: '2.3 MB'
          }
        ]
      },
      {
        id: 'msg-3',
        sender: {
          id: 'current-user',
          name: 'Rachel Johnson',
          role: 'Senior Visa Officer',
          avatarUrl: null
        },
        body: 'Thank you for providing the bank statement. I have added it to your application.\n\nRegards,\nRachel Johnson\nSenior Visa Officer',
        timestamp: '2025-10-03T11:30:00Z',
        read: true
      }
    ]
  },
  {
    id: 'thread-3',
    participants: [
      {
        id: 'user-3',
        name: 'David Chen',
        role: 'Financial Verification Specialist',
        avatarUrl: null
      }
    ],
    subject: 'Financial verification for application UK-2024-1836',
    lastMessageTimestamp: '2025-10-02T16:45:00Z',
    lastMessageSnippet: 'I\'ve completed the financial verification for application UK-2024-1836...',
    unreadCount: 0,
    category: 'InMail',
    messages: [
      {
        id: 'msg-4',
        sender: {
          id: 'user-3',
          name: 'David Chen',
          role: 'Financial Verification Specialist',
          avatarUrl: null
        },
        subject: 'Financial verification for application UK-2024-1836',
        body: 'Hi Rachel,\n\nI\'ve completed the financial verification for application UK-2024-1836. All documents appear to be in order, and the applicant meets the financial requirements.\n\nLet me know if you need any further information.\n\nRegards,\nDavid Chen\nFinancial Verification Specialist',
        timestamp: '2025-10-02T16:45:00Z',
        read: true
      }
    ]
  },
  {
    id: 'thread-4',
    participants: [
      {
        id: 'user-4',
        name: 'Sarah Johnson',
        role: 'Senior Visa Officer',
        avatarUrl: null
      }
    ],
    subject: 'Application review request',
    lastMessageTimestamp: '2025-10-02T14:20:00Z',
    lastMessageSnippet: 'Could you please review the attached application? I\'m not sure about...',
    unreadCount: 0,
    category: 'InMail',
    messages: [
      {
        id: 'msg-5',
        sender: {
          id: 'user-4',
          name: 'Sarah Johnson',
          role: 'Senior Visa Officer',
          avatarUrl: null
        },
        subject: 'Application review request',
        body: 'Hi Rachel,\n\nCould you please review the attached application? I\'m not sure about the employment verification section.\n\nThanks,\nSarah',
        timestamp: '2025-10-02T14:20:00Z',
        read: true,
        attachments: [
          {
            name: 'application_UK-2024-1840.pdf',
            url: '#',
            size: '4.1 MB'
          }
        ]
      },
      {
        id: 'msg-6',
        sender: {
          id: 'current-user',
          name: 'Rachel Johnson',
          role: 'Senior Visa Officer',
          avatarUrl: null
        },
        body: 'Hi Sarah,\n\nI\'ve reviewed the application. The employment verification looks good, but we should request additional documentation for the income sources.\n\nI\'ll handle this.\n\nRegards,\nRachel',
        timestamp: '2025-10-02T15:45:00Z',
        read: true
      }
    ]
  },
  {
    id: 'thread-5',
    participants: [
      {
        id: 'user-5',
        name: 'Robert Brown',
        role: 'Applicant',
        avatarUrl: null
      }
    ],
    subject: 'Status of my visa application',
    lastMessageTimestamp: '2025-10-01T09:30:00Z',
    lastMessageSnippet: 'I submitted my visa application two weeks ago and I haven\'t heard anything...',
    unreadCount: 0,
    category: 'Inbox',
    messages: [
      {
        id: 'msg-7',
        sender: {
          id: 'user-5',
          name: 'Robert Brown',
          role: 'Applicant',
          avatarUrl: null
        },
        subject: 'Status of my visa application',
        body: 'Dear Visa Officer,\n\nI submitted my visa application (reference: UK-2024-1825) two weeks ago and I haven\'t heard anything yet. Could you please provide an update on the status of my application?\n\nThank you,\nRobert Brown',
        timestamp: '2025-10-01T09:30:00Z',
        read: true
      },
      {
        id: 'msg-8',
        sender: {
          id: 'current-user',
          name: 'Rachel Johnson',
          role: 'Senior Visa Officer',
          avatarUrl: null
        },
        body: 'Dear Mr. Brown,\n\nThank you for your inquiry. Your application (UK-2024-1825) is currently under review. The standard processing time is 3-4 weeks, so it\'s still within the normal timeframe.\n\nWe will contact you if we need any additional information.\n\nBest regards,\nRachel Johnson\nSenior Visa Officer',
        timestamp: '2025-10-01T11:15:00Z',
        read: true
      }
    ]
  },
  {
    id: 'thread-6',
    participants: [
      {
        id: 'system',
        name: 'System Notification',
        role: 'System',
        avatarUrl: null
      }
    ],
    subject: 'New application assigned to you',
    lastMessageTimestamp: '2025-10-04T08:00:00Z',
    lastMessageSnippet: 'A new visa application (UK-2024-1842) has been assigned to you for review...',
    unreadCount: 1,
    category: 'Applications',
    messages: [
      {
        id: 'msg-9',
        sender: {
          id: 'system',
          name: 'System Notification',
          role: 'System',
          avatarUrl: null
        },
        subject: 'New application assigned to you',
        body: 'A new visa application (UK-2024-1842) has been assigned to you for review.\n\nApplicant: Robert Chen\nVisa Type: Tourist\nPriority: Low\n\nPlease review the application at your earliest convenience.',
        timestamp: '2025-10-04T08:00:00Z',
        read: false
      }
    ]
  },
  {
    id: 'thread-7',
    participants: [
      {
        id: 'user-6',
        name: 'Michael Smith',
        role: 'Applicant',
        avatarUrl: null
      }
    ],
    subject: 'Thank you for approving my visa',
    lastMessageTimestamp: '2025-09-30T16:20:00Z',
    lastMessageSnippet: 'I wanted to thank you for approving my visa application. I received...',
    unreadCount: 0,
    category: 'Inbox',
    messages: [
      {
        id: 'msg-10',
        sender: {
          id: 'user-6',
          name: 'Michael Smith',
          role: 'Applicant',
          avatarUrl: null
        },
        subject: 'Thank you for approving my visa',
        body: 'Dear Visa Officer,\n\nI wanted to thank you for approving my visa application. I received my visa yesterday and I\'m very excited about my upcoming trip to the UK.\n\nThank you for your assistance throughout the process.\n\nBest regards,\nMichael Smith',
        timestamp: '2025-09-30T16:20:00Z',
        read: true
      }
    ]
  },
  {
    id: 'thread-8',
    participants: [
      {
        id: 'user-7',
        name: 'Uma Mirza',
        role: 'Visa History Specialist',
        avatarUrl: null
      }
    ],
    subject: 'Draft response to applicant query',
    lastMessageTimestamp: '2025-10-03T17:45:00Z',
    lastMessageSnippet: 'I\'ve drafted a response to the applicant\'s query about their previous visa...',
    unreadCount: 0,
    category: 'Drafts',
    messages: [
      {
        id: 'msg-11',
        sender: {
          id: 'current-user',
          name: 'Rachel Johnson',
          role: 'Senior Visa Officer',
          avatarUrl: null
        },
        subject: 'Draft response to applicant query',
        body: 'Hi Uma,\n\nI\'ve drafted a response to the applicant\'s query about their previous visa history. Could you please review it before I send it?\n\n"Dear Mr. Patel,\n\nRegarding your question about your previous visa refusal, we need additional documentation to clarify the circumstances. Please provide a detailed explanation letter and any supporting evidence related to the previous refusal.\n\nThank you,\nRachel Johnson\nSenior Visa Officer"\n\nLet me know if this looks good or if you have any suggestions.\n\nRegards,\nRachel',
        timestamp: '2025-10-03T17:45:00Z',
        read: true
      }
    ]
  }
];
