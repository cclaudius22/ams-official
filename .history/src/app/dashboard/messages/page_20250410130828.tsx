// src/app/dashboard/messages/page.tsx
'use client'

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageList from '@/components/messages/MessageList'; 
import MessageView from '@/components/messages/MessageView'; 
import ComposeMessageDialog from '@/components/messages/ComposeMessageDialog';
import { Button } from '@/components/ui/button';
import { PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Import mock data (replace with API call + TanStack Query later)
import { mockMessageThreads, MessageThread, MessageSender } from '@/lib/mockdata-messages'; // Adjust path

export default function MessagesPage() {
    const [allThreads, setAllThreads] = useState<MessageThread[]>(mockMessageThreads); // Holds all threads
    const [selectedTab, setSelectedTab] = useState<string>('Inbox'); // Default tab
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null); // Which thread is open
    const [composeDialogOpen, setComposeDialogOpen] = useState(false); // Control compose dialog visibility

    // Filter threads based on selected tab
    const filteredThreads = useMemo(() => {
        return allThreads.filter(thread => thread.category === selectedTab);
    }, [allThreads, selectedTab]);

    // Find the currently selected thread data
    const selectedThread = useMemo(() => {
        if (!selectedThreadId) return null;
        return allThreads.find(thread => thread.id === selectedThreadId) || null;
    }, [allThreads, selectedThreadId]);

    // Select the first thread in the list when tab changes and no thread is selected
    // Or if the selected thread is no longer in the filtered list
    React.useEffect(() => {
        if (filteredThreads.length > 0) {
            const currentSelectionInList = filteredThreads.some(t => t.id === selectedThreadId);
            if (!selectedThreadId || !currentSelectionInList) {
                 setSelectedThreadId(filteredThreads[0].id); // Select the first one
            }
        } else {
            setSelectedThreadId(null); // No threads in this tab
        }
    }, [filteredThreads, selectedTab, selectedThreadId]); // Rerun when filter/tab changes

    // Calculate unread counts for badges (simple example)
    const unreadCounts = useMemo(() => {
        const counts: Record<string, number> = { Inbox: 0, InMail: 0, Applications: 0, Unread: 0 }; // Only count for relevant tabs
        let totalUnread = 0;
        allThreads.forEach(thread => {
            if (thread.unreadCount > 0) {
                totalUnread += thread.unreadCount;
                if (counts[thread.category] !== undefined) {
                    counts[thread.category] += thread.unreadCount;
                }
            }
        });
        counts.Unread = totalUnread; // Special 'Unread' tab count
        return counts;
    }, [allThreads]);

    // Handle sending a new message
    const handleSendMessage = (messageData: any) => {
        // In a real implementation, this would call an API
        console.log('Sending message:', messageData);
        
        // For now, we'll just add it to the mock data
        const newThread: MessageThread = {
            id: `thread-${Date.now()}`,
            participants: [messageData.recipient],
            subject: messageData.subject,
            lastMessageTimestamp: new Date().toISOString(),
            lastMessageSnippet: messageData.body.substring(0, 50) + (messageData.body.length > 50 ? '...' : ''),
            unreadCount: 0,
            category: 'Sent',
            messages: [
                {
                    id: `msg-${Date.now()}`,
                    sender: {
                        id: 'current-user',
                        name: 'Current User',
                        role: 'Officer'
                    },
                    subject: messageData.subject,
                    body: messageData.body,
                    timestamp: new Date().toISOString(),
                    read: true,
                    attachments: messageData.attachments ? messageData.attachments.map((file: any) => ({
                        name: file.name,
                        url: '#',
                        size: `${Math.round(file.size / 1024)} KB`
                    })) : undefined
                }
            ]
        };
        
        setAllThreads(prev => [newThread, ...prev]);
        setSelectedTab('Sent');
        setSelectedThreadId(newThread.id);
    };

    // Get unique recipients for the compose dialog
    const uniqueRecipients = useMemo(() => {
        const recipientsMap = new Map<string, MessageSender>();
        allThreads.forEach(thread => {
            thread.participants.forEach(participant => {
                if (!recipientsMap.has(participant.id)) {
                    recipientsMap.set(participant.id, participant);
                }
            });
        });
        return Array.from(recipientsMap.values());
    }, [allThreads]);

    return (
        // Main container using flexbox for side-by-side layout
        <div className="flex h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Left Panel: Tabs and Message List */}
            <div className="w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex flex-col">
                 {/* Header Area (Optional: Could have search or compose) */}
                 <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setComposeDialogOpen(true)}
                    >
                        <PenSquare className="h-4 w-4" />
                        <span className="sr-only">Compose Message</span>
                    </Button>
                 </div>

                 {/* Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-shrink-0">
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto px-1 py-1"> {/* Adjusted for more tabs */}
                        {/* Map over tabs for dynamic rendering */}
                        {['Inbox', 'InMail', 'Applications', 'Unread', 'Sent', 'Drafts'].map(tab => (
                            <TabsTrigger key={tab} value={tab} className="relative text-xs px-2 h-8">
                                {tab}
                                {unreadCounts[tab] > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-4 w-auto min-w-[1rem] px-1 rounded-full text-[9px] flex items-center justify-center bg-red-500 text-white">
                                        {unreadCounts[tab]}
                                    </Badge>
                                )}
                            </TabsTrigger>
                         ))}
                    </TabsList>
                </Tabs>

                {/* Message List Area (Scrollable) */}
                <div className="flex-1 overflow-y-auto">
                    <MessageList
                        threads={filteredThreads}
                        selectedThreadId={selectedThreadId}
                        onSelectThread={setSelectedThreadId} // Pass setter function
                    />
                </div>
            </div>

            {/* Right Panel: Message View */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedThread ? (
                    <MessageView thread={selectedThread} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        {/* Select a message Icon */}
                        <PenSquare className="h-16 w-16 mb-4 text-gray-300" />
                        <p>Select a message to view</p>
                         {filteredThreads.length === 0 && <p className="text-sm mt-2">No messages in this folder.</p>}
                    </div>
                )}
            </div>

            {/* Compose Message Dialog */}
            <ComposeMessageDialog
                isOpen={composeDialogOpen}
                onClose={() => setComposeDialogOpen(false)}
                onSend={handleSendMessage}
                availableRecipients={uniqueRecipients}
            />
        </div>
    );
}
