// src/lib/mockdata-messages.ts

export interface MessageSender {
    id: string;
    name: string;
    role?: string; // e.g., Applicant, Officer, System
    avatarUrl?: string; // Optional avatar
}

export interface Message {
    id: string;
    sender: MessageSender;
    subject: string;
    body: string; // Can be plain text or potentially HTML/Markdown later
    timestamp: string | Date;
    read: boolean;
    attachments?: { name: string; url: string; size?: string }[]; // Optional attachments
    relatedApplicationId?: string; // Link to an application
}

// A thread groups messages, often by subject or initial sender/recipient
export interface MessageThread {
    id: string;
    participants: MessageSender[]; // Participants in the thread
    subject: string;
    lastMessageTimestamp: string | Date;
    lastMessageSnippet: string; // Short preview of the last message
    unreadCount: number;
    messages: Message[]; // Array of individual messages in the thread
    category: 'Inbox' | 'InMail' | 'Applications' | 'Drafts' | 'Sent'; // For filtering
}


// --- Mock Data ---

const applicantJohn: MessageSender = { id: 'user-john-doe', name: 'John James Doe', role: 'Applicant' };
const officerSarah: MessageSender = { id: 'off1', name: 'Sarah Johnson', role: 'Senior Visa Officer' };
const officerMike: MessageSender = { id: 'off2', name: 'Mike Fitzgerald', role: 'Officer' };
const systemSender: MessageSender = { id: 'system', name: 'Visa System', role: 'System' };


export const mockMessageThreads: MessageThread[] = [
    {
        id: 'thread-001',
        participants: [applicantJohn, officerSarah],
        subject: 'Re: Question about Financial Document Upload',
        lastMessageTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
        lastMessageSnippet: "Thanks Sarah, I've uploaded the corrected bank statement now.",
        unreadCount: 0,
        category: 'Inbox', // Or 'Applications' if linked
        messages: [
            { id: 'msg-001a', sender: officerSarah, subject: 'Question about Financial Document Upload', body: 'Hi John,\n\nPlease could you re-upload page 3 of your bank statement? The copy provided was unclear.\n\nThanks,\nSarah Johnson', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true, relatedApplicationId: 'UK-2024-1836' },
            { id: 'msg-001b', sender: applicantJohn, subject: 'Re: Question about Financial Document Upload', body: "Hi Sarah,\n\nApologies for that. Please find the clearer copy attached.\n\nBest,\nJohn", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: true, attachments: [{ name: 'bank_statement_pg3_clear.pdf', url: '#', size: '112 KB' }] },
            { id: 'msg-001c', sender: applicantJohn, subject: 'Re: Question about Financial Document Upload', body: "Thanks Sarah, I've uploaded the corrected bank statement now.", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: true },
        ]
    },
    {
        id: 'thread-002',
        participants: [officerMike, officerSarah], // Internal message
        subject: 'Case Transfer: UK-2024-1835 - Robert Chen',
        lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        lastMessageSnippet: "Okay, I'll take a look this afternoon. Seems complex.",
        unreadCount: 1,
        category: 'InMail',
        messages: [
             { id: 'msg-002a', sender: officerSarah, subject: 'Case Transfer: UK-2024-1835 - Robert Chen', body: "Hi Mike,\n\nCould you take over review for application UK-2024-1835? There are some flags regarding source of funds I need a second opinion on.\n\nThanks,\nSarah", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), read: false }, // Unread by current user assumed to be Mike
             { id: 'msg-002b', sender: officerMike, subject: 'Re: Case Transfer: UK-2024-1835 - Robert Chen', body: "Okay, I'll take a look this afternoon. Seems complex.", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: true }, // Read by Sarah
        ]
    },
     {
        id: 'thread-003',
        participants: [systemSender], // System notification
        subject: 'SLA Breach Warning: UK-2024-1840',
        lastMessageTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        lastMessageSnippet: "Application UK-2024-1840 is due to breach SLA within 4 hours.",
        unreadCount: 1,
        category: 'Inbox',
        messages: [
            { id: 'msg-003a', sender: systemSender, subject: 'SLA Breach Warning: UK-2024-1840', body: "Application UK-2024-1840 (Applicant: Fatima Al-Sayed) assigned to Justin Time is due to breach its Service Level Agreement within the next 4 hours. Please review or reassign.", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: false },
        ]
    },
     {
        id: 'thread-004',
        participants: [officerSarah], // Sent item
        subject: 'Clarification needed: Visa Photo UK-2024-1836',
        lastMessageTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        lastMessageSnippet: "Hi Emma, Could you please provide a new visa photo...",
        unreadCount: 0, // No unread in sent items
        category: 'Sent',
        messages: [
             { id: 'msg-004a', sender: officerSarah, subject: 'Clarification needed: Visa Photo UK-2024-1836', body: "Hi Emma,\n\nCould you please provide a new visa photo adhering to the background requirements outlined in the guidance?\n\nRegards,\nSarah Johnson", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: true }, // Always read in sent
        ]
    },
      {
        id: 'draft-001',
        participants: [officerSarah], // Draft is just from sender
        subject: 'Follow up on UK-2024-1835',
        lastMessageTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
        lastMessageSnippet: "Hi Mike, Just checking if you had a chance to look at...",
        unreadCount: 0,
        category: 'Drafts',
        messages: [
             { id: 'msg-draft-001a', sender: officerSarah, subject: 'Follow up on UK-2024-1835', body: "Hi Mike,\n\nJust checking if you had a chance to look at the source of funds query for UK-2024-1835?\n\nBest,\nSarah", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), read: true },
        ]
    },
];