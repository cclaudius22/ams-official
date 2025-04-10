import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { MessageThread } from '@/lib/mockdata-messages'; // Assuming mockdata path is correct
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MessageListItemProps {
    thread: MessageThread;
    isSelected: boolean;
    onSelect: () => void;
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function MessageListItem({ thread, isSelected, onSelect }: MessageListItemProps) {
    // Keep the original Date object calculation
    const lastMessageDate = new Date(thread.lastMessageTimestamp);

    // --- State for Client-Side Rendering ---
    // Initialize with consistent, non-dynamic values for SSR & initial client render
    const [displayTime, setDisplayTime] = useState(lastMessageDate.toLocaleDateString()); // Use a simple, consistent format initially
    const [displayTitle, setDisplayTitle] = useState(lastMessageDate.toISOString()); // ISO string is reliable and consistent

    useEffect(() => {
        // This effect runs only on the client, after the component has hydrated
        const timeAgo = formatDistanceToNow(lastMessageDate, { addSuffix: true });
        const localeTitle = lastMessageDate.toLocaleString(); // Calculate locale-specific title client-side

        // Update state to trigger re-render with client-specific values
        setDisplayTime(timeAgo);
        setDisplayTitle(localeTitle);

    }, [lastMessageDate]); // Dependency array ensures this runs if the date changes

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
                    <span className={cn(
                       "text-sm truncate",
                       thread.unreadCount > 0 ? "text-gray-800 font-semibold" : "text-gray-700"
                    )}>
                        {displaySender}
                        {thread.participants.length > 1 && <span className="text-xs text-gray-400 ml-1">(+{thread.participants.length -1})</span>}
                    </span>
                     {/* --- Use State for Display --- */}
                     <span className="text-xs text-gray-400 flex-shrink-0 ml-2" title={displayTitle}>
                        {displayTime}
                     </span>
                </div>
                 <p className={cn(
                     "text-xs truncate",
                     thread.unreadCount > 0 ? "text-gray-700 font-semibold" : "text-gray-600"
                  )}>
                    {thread.subject}
                 </p>
                 <p className="text-xs text-gray-500 truncate mt-0.5">
                    {thread.lastMessageSnippet}
                 </p>
            </div>

             {/* Unread Badge */}
            {thread.unreadCount > 0 && (
                 <Badge className="h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center bg-blue-500 text-white mt-1 ml-1">
                     {thread.unreadCount}
                 </Badge>
             )}
        </button>
    );
}