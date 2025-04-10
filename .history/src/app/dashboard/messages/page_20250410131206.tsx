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
            <div className="w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex flex-col bg-gray-50">
                {/* Header Area with cleaner design */}
                <div className="p-5 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-medium text-gray-800">Messages</h2>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full hover:bg-gray-100"
                        onClick={() => setComposeDialogOpen(true)}
                    >
                        <PenSquare className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">Compose Message</span>
                    </Button>
                </div>

                {/* Simplified Tabs */}
                <div className="px-5 pt-4 pb-2 bg-white border-b border-gray-100">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-shrink-0">
                        <TabsList className="w-full bg-gray-50/80 p-1 rounded-md">
                            {/* Primary tabs with cleaner design */}
                            {['Inbox', 'Sent', 'Drafts'].map(tab => (
                                <TabsTrigger 
                                    key={tab} 
                                    value={tab} 
                                    className="relative text-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    {tab}
                                    {unreadCounts[tab] > 0 && (
                                        <Badge className="ml-1.5 h-5 min-w-[20px] px-1 rounded-full text-[10px] flex items-center justify-center bg-blue-500 text-white">
                                            {unreadCounts[tab]}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        {/* Secondary tabs as links */}
                        <div className="flex gap-3 mt-3 px-1 text-xs text-gray-500">
                            {['InMail', 'Applications', 'Unread'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`flex items-center ${selectedTab === tab ? 'text-blue-600 font-medium' : 'hover:text-gray-800'}`}
                                >
                                    {tab}
                                    {unreadCounts[tab] > 0 && (
                                        <span className="ml-1 text-[10px] font-medium text-blue-600">
                                            ({unreadCounts[tab]})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Tabs>
                </div>

                {/* Message List Area (Scrollable) with improved spacing */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <MessageList
                        threads={filteredThreads}
                        selectedThreadId={selectedThreadId}
                        onSelectThread={setSelectedThreadId}
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
