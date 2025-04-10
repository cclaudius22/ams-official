// src/components/messages/MessageListItem.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn Avatar
import { Badge } from '@/components/ui/badge';
import { MessageThread } from '@/lib/mockdata-messages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns'; // For relative time

interface MessageListItemProps {
    thread: MessageThread;
    isSelected: boolean;
    onSelect: () => void;
}

// Helper to get initials from name
const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function MessageListItem({ thread, isSelected, onSelect }: MessageListItemProps) {
    const lastMessageDate = new Date(thread.lastMessageTimestamp);
    const timeAgo = formatDistanceToNow(lastMessageDate, { addSuffix: true });

    // Determine sender display (simplified: shows first participant who isn't assumed 'self')
    // This needs refinement based on logged-in user context
    const displaySender = thread.participants[0]?.name || 'Unknown Sender';
    const senderInitials = getInitials(displaySender);
    const avatarUrl = thread.participants[0]?.avatarUrl; // Use first participant's avatar

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
                     <span className="text-xs text-gray-400 flex-shrink-0 ml-2" title={lastMessageDate.toLocaleString()}>
                        {timeAgo}
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