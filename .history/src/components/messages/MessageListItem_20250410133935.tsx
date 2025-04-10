// src/components/messages/MessageListItem.tsx
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { MessageThread } from '@/lib/mockdata-messages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface MessageListItemProps {
    thread: MessageThread;
    isSelected: boolean;
    onSelect: () => void;
}

// Helper to get initials from name
const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

export default function MessageListItem({ thread, isSelected, onSelect }: MessageListItemProps) {
    // State to hold client-side rendered values
    const [displayTime, setDisplayTime] = useState('');
    const [displayTitle, setDisplayTitle] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const lastMessageDate = new Date(thread.lastMessageTimestamp);
        setDisplayTime(formatDistanceToNow(lastMessageDate, { addSuffix: true }));
        setDisplayTitle(format(lastMessageDate, "MMM d, yyyy 'at' h:mm a"));
    }, [thread.lastMessageTimestamp]);

    // Determine sender display
    const displaySender = thread.participants[0]?.name || 'Unknown Sender';
    const senderInitials = getInitials(displaySender);
    const avatarUrl = thread.participants[0]?.avatarUrl;
    
    // Determine if this is a system message
    const isSystemMessage = thread.participants[0]?.role === 'System';

    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full text-left py-3.5 px-5 flex gap-3 items-start transition-colors duration-150",
                isSelected 
                    ? "bg-blue-50/70 border-l-4 border-blue-500" 
                    : "hover:bg-gray-50 border-l-4 border-transparent",
                thread.unreadCount > 0 ? "bg-blue-50/30" : ""
            )}
        >
            {/* Avatar with improved styling */}
            <Avatar className={cn(
                "flex-shrink-0 h-10 w-10",
                isSystemMessage ? "bg-gray-100 text-gray-600" : ""
            )}>
                <AvatarImage src={avatarUrl || undefined} alt={displaySender} />
                <AvatarFallback>{senderInitials}</AvatarFallback>
            </Avatar>

            {/* Content with improved typography */}
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                    <span className={cn(
                        "text-sm font-medium truncate",
                        thread.unreadCount > 0 ? "text-gray-900" : "text-gray-700",
                        isSystemMessage ? "text-gray-600" : ""
                    )}>
                        {displaySender}
                        {thread.participants[0]?.role && !isSystemMessage && (
                            <span className="ml-1.5 text-xs font-normal text-gray-500">
                                ({thread.participants[0].role})
                            </span>
                        )}
                    </span>
                    
                    {isClient ? (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2" title={displayTitle}>
                            {displayTime}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">...</span>
                    )}
                </div>
                
                {/* Subject line with better contrast */}
                <p className={cn(
                    "text-sm truncate mb-1",
                    thread.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-700"
                )}>
                    {thread.subject}
                </p>
                
                {/* Message preview with better spacing */}
                <p className="text-xs text-gray-500 line-clamp-1">
                    {thread.lastMessageSnippet}
                </p>
            </div>

            {/* Unread indicator as a dot instead of a badge for cleaner look */}
            {thread.unreadCount > 0 && (
                <div className="flex flex-col items-end ml-2 mt-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                    {thread.unreadCount > 1 && (
                        <span className="text-xs font-medium text-blue-600 mt-1">
                            {thread.unreadCount}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
}
