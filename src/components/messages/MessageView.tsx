// src/components/messages/MessageView.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send } from 'lucide-react';
import { MessageThread, Message } from '@/lib/mockdata-messages';
import { format } from 'date-fns'; 
import { cn } from '@/lib/utils';

// Helper to get initials from name
const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

interface MessageViewProps {
    thread: MessageThread;
    // Add onSubmitReply prop later
}

// Component for displaying a single message bubble
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const senderInitials = getInitials(message.sender.name);
    const messageDate = new Date(message.timestamp);
    const formattedTime = format(messageDate, 'p'); // e.g., 1:30 PM
    const formattedDate = format(messageDate, 'PP'); // e.g., Apr 12, 2025

    // TODO: Add logic to determine if message is from 'self' for styling
    const isSelf = false; // Placeholder

    return (
        <div className={cn("flex gap-3 my-4", isSelf ? "justify-end" : "justify-start")}>
            {!isSelf && (
                 <Avatar className="h-8 w-8 flex-shrink-0">
                     <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                     <AvatarFallback>{senderInitials}</AvatarFallback>
                 </Avatar>
            )}
            <div className={cn(
                "p-3 rounded-lg max-w-[70%]",
                isSelf ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-800"
            )}>
                <div className="flex justify-between items-baseline mb-1 text-xs">
                    {!isSelf && <span className="font-semibold mr-2">{message.sender.name}</span>}
                    <span className={cn("opacity-70", isSelf ? "text-blue-100" : "text-gray-500")} title={formattedDate}>
                       {formattedTime}
                    </span>
                </div>
                 {/* Render body - Use whitespace-pre-wrap to respect newlines */}
                 <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                 {/* Render Attachments */}
                 {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300/50 space-y-1">
                       {message.attachments.map((att, index) => (
                          <a key={index} href={att.url} target="_blank" rel="noopener noreferrer"
                             className={cn("text-xs flex items-center gap-1 hover:underline", isSelf ? "text-blue-100" : "text-blue-600")}>
                             <Paperclip className="h-3 w-3"/>
                             {att.name} {att.size && `(${att.size})`}
                          </a>
                       ))}
                    </div>
                 )}
            </div>
             {isSelf && ( // Show avatar on the right for self messages
                 <Avatar className="h-8 w-8 flex-shrink-0">
                     {/* Assume 'self' avatar logic */}
                     <AvatarFallback>ME</AvatarFallback>
                 </Avatar>
            )}
        </div>
    );
};


export default function MessageView({ thread }: MessageViewProps) {
    const [replyText, setReplyText] = React.useState('');

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        console.log("Sending Reply:", replyText);
        // TODO: Call mutation/API here
        setReplyText(''); // Clear input after sending
        alert("Reply sending not implemented yet.");
    };

    return (
        <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <h3 className="font-semibold text-base truncate">{thread.subject}</h3>
                <p className="text-xs text-gray-500 truncate">
                    Participants: {thread.participants.map(p => p.name).join(', ')}
                </p>
                 {/* Optional: Link to related Application */}
                {thread.messages[0]?.relatedApplicationId && (
                     <a href={`/dashboard/reviewer/${thread.messages[0].relatedApplicationId}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline">
                        Related Application: {thread.messages[0].relatedApplicationId}
                     </a>
                 )}
            </div>

            {/* Message List Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {thread.messages.map((message) => (
                     <MessageBubble key={message.id} message={message} />
                 ))}
                 {/* Add a loading indicator here if fetching older messages */}
            </div>

            {/* Reply Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendReply}>
                    <Textarea
                        placeholder="Type your reply here..."
                        className="min-h-[80px] mb-2"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                        <Button type="button" variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                            <Paperclip className="h-4 w-4" />
                             <span className="sr-only">Attach file</span>
                        </Button>
                        <Button type="submit" disabled={!replyText.trim()}>
                            <Send className="h-4 w-4 mr-2" /> Send Reply
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}