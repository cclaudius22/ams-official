// src/components/messages/MessageListItem.tsx
import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { MessageThread } from '@/lib/mockdata-messages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns'; // Import format

interface MessageListItemProps {
    thread: MessageThread;
    isSelected: boolean;
    onSelect: () => void;
}

const getInitials = (name: string): string => { /* ... as before ... */ };

export default function MessageListItem({ thread, isSelected, onSelect }: MessageListItemProps) {
    // --- State to hold client-side rendered values ---
    const [displayTime, setDisplayTime] = useState('');
    const [displayTitle, setDisplayTitle] = useState('');
    const [isClient, setIsClient] = useState(false); // Flag to check if mounted

    useEffect(() => {
        // This effect runs only on the client after hydration
        setIsClient(true); // Set flag to true

        // Calculate date/time values *after* mounting
        const lastMessageDate = new Date(thread.lastMessageTimestamp);
        setDisplayTime(formatDistanceToNow(lastMessageDate, { addSuffix: true }));
        // Use a consistent, non-locale-sensitive format for the title initially,
        // or format using a specific locale like 'en-GB'
        setDisplayTitle(format(lastMessageDate, "yyyy-MM-dd'T'HH:mm:ssxxx")); // ISO 8601 with timezone is safe
        // Or: setDisplayTitle(lastMessageDate.toLocaleString('en-GB')); // If locale consistency is okay

    }, [thread.lastMessageTimestamp]); // Re-run if the timestamp changes


    // Determine sender display
    const displaySender = thread.participants[0]?.name || 'Unknown Sender';
    const senderInitials = getInitials(displaySender);
    const avatarUrl = thread.participants[0]?.avatarUrl;

    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full text-left p-3 flex gap-3 items-start hover:bg-gray-50 focus:outline-none focus:bg-blue-50 transition-colors duration-150",
                isSelected ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent",
                thread.unreadCount > 0 ? "font-semibold" : "font-normal"
            )}
        >
            {/* Avatar */}
            <Avatar className="h-9 w-9 mt-1">
                <AvatarImage src={avatarUrl} alt={displaySender} />
                <AvatarFallback>{senderInitials}</AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-0.5">
                    <span className={cn( /* ... */ )}>
                        {displaySender}
                        {/* ... */}
                    </span>
                     {/* --- Use State for Display --- */}
                     {/* Render only after client mount OR render placeholder initially */}
                     {isClient ? (
                         <span className="text-xs text-gray-400 flex-shrink-0 ml-2" title={displayTitle}>
                            {displayTime}
                         </span>
                      ) : (
                         // Optional: Render a placeholder during SSR / initial hydration
                         <span className="text-xs text-gray-400 flex-shrink-0 ml-2">...</span>
                      )}
                     {/* --- End Use State for Display --- */}
                </div>
                 <p className={cn( /* ... */ )}>
                    {thread.subject}
                 </p>
                 <p className="text-xs text-gray-500 truncate mt-0.5">
                    {thread.lastMessageSnippet}
                 </p>
            </div>

             {/* Unread Badge */}
             {/* ... */}
        </button>
    );
}