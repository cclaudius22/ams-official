// src/components/messages/MessageList.tsx
import React from 'react';
import MessageListItem from './MessageListItem';
import { MessageThread } from '@/lib/mockdata-messages'; 

interface MessageListProps {
    threads: MessageThread[];
    selectedThreadId: string | null;
    onSelectThread: (threadId: string) => void;
}

export default function MessageList({ threads, selectedThreadId, onSelectThread }: MessageListProps) {
    if (threads.length === 0) {
        return <div className="p-4 text-center text-sm text-gray-400">No messages in this view.</div>;
    }

    return (
        // No padding here, handled by items
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