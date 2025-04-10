// src/components/messages/MessageList.tsx
import React from 'react';
import MessageListItem from './MessageListItem';
import { MessageThread } from '@/lib/mockdata-messages'; 
import { Inbox } from 'lucide-react';

interface MessageListProps {
    threads: MessageThread[];
    selectedThreadId: string | null;
    onSelectThread: (threadId: string) => void;
}

export default function MessageList({ threads, selectedThreadId, onSelectThread }: MessageListProps) {
    if (threads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No messages</p>
                <p className="text-sm text-gray-400 mt-1 max-w-[220px]">
                    There are no messages in this folder yet.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {threads.map(thread => (
                <MessageListItem
                    key={thread.id}
                    thread={thread}
                    isSelected={thread.id === selectedThreadId}
                    onSelect={() => onSelectThread(thread.id)}
                />
            ))}
        </div>
    );
}
