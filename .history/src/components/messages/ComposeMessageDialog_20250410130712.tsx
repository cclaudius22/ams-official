// src/components/messages/ComposeMessageDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send } from 'lucide-react';
import { MessageSender } from '@/lib/mockdata-messages';

interface ComposeMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: {
    recipient: MessageSender;
    subject: string;
    body: string;
    attachments?: File[];
  }) => void;
  availableRecipients: MessageSender[]; // List of possible recipients
}

export default function ComposeMessageDialog({
  isOpen,
  onClose,
  onSend,
  availableRecipients
}: ComposeMessageDialogProps) {
  // Form state
  const [recipient, setRecipient] = useState<MessageSender | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject.trim() || !body.trim()) return;
    
    onSend({
      recipient,
      subject,
      body,
      attachments
    });
    
    // Reset form
    setRecipient(null);
    setSubject('');
    setBody('');
    setAttachments([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Compose New Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium">To:</div>
            <select 
              id="recipient"
              className="w-full p-2 border rounded-md"
              value={recipient?.id || ''}
              onChange={(e) => {
                const selected = availableRecipients.find(r => r.id === e.target.value);
                setRecipient(selected || null);
              }}
              required
            >
              <option value="">Select recipient...</option>
              {availableRecipients.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.role ? `(${r.role})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Subject */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Subject:</div>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              required
            />
          </div>
          
          {/* Message Body */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Message:</div>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[150px]"
              required
            />
          </div>
          
          {/* Attachments */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Attachments:</div>
            <div className="flex items-center gap-2">
              <Input
                id="attachments"
                type="file"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setAttachments(Array.from(e.target.files));
                  }
                }}
                className="flex-1"
                multiple
              />
              <Button type="button" variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Display selected files */}
            {attachments.length > 0 && (
              <ul className="text-sm text-gray-600 mt-2">
                {attachments.map((file, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!recipient || !subject.trim() || !body.trim()}
            >
              <Send className="h-4 w-4 mr-2" /> Send Message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
