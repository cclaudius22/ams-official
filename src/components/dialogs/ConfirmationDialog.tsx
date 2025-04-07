// src/components/dialogs/NoteDialog.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteText: string;
  onNoteChange: (text: string) => void;
  onSave: () => void;
}

export default function NoteDialog({
  isOpen,
  onClose,
  noteText,
  onNoteChange,
  onSave
}: NoteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Enter your notes here..."
            className="min-h-[150px]"
            value={noteText}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}