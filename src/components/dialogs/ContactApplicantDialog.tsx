// components/dialogs/ContactApplicantDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import if you want an explicit close button
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Mail, Phone, Send, Video, Info } from 'lucide-react';

interface ContactApplicantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: { // Receive contact details
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  };
  // Callbacks for actions within the modal
  onRequestInfo: () => void;
  onScheduleCall: () => void; // Placeholder for now
}

export default function ContactApplicantDialog({
  isOpen,
  onClose,
  contact,
  onRequestInfo,
  onScheduleCall
}: ContactApplicantDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Contact Applicant: {contact.name || 'Details'}</DialogTitle>
          <DialogDescription>
            Review contact information and choose an action.
          </DialogDescription>
        </DialogHeader>

        {/* Display Contact Info */}
        <div className="grid gap-4 py-4">
          {contact.email && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">Email:</span>
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline truncate" title={contact.email}>
                  {contact.email}
                </a>
              </div>
               {/* Optional: Button to copy email */}
               {/* <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button> */}
            </div>
          )}
          {contact.phoneNumber && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
               <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span>{contact.phoneNumber}</span>
               </div>
                {/* Optional: Button to copy phone */}
               {/* <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button> */}
            </div>
          )}
          {!contact.email && !contact.phoneNumber && (
             <p className="text-sm text-center text-red-600 py-4">No contact information available for this applicant.</p>
          )}
        </div>

        {/* Action Buttons */}
        <DialogFooter className="sm:justify-between gap-2"> {/* Changed alignment */}
            {/* Close Button (Optional) */}
            {/* <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose> */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => {
                      onRequestInfo(); // Trigger parent handler
                      // No need to close here, parent handles RequestInfoDialog opening
                   }}
                   disabled={!contact.email} // Can only request info via email?
                   className="flex-1"
                 >
                   <Info className="h-4 w-4 mr-2" /> Request Additional Info
                 </Button>
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => {
                      onScheduleCall(); // Trigger parent handler
                      onClose(); // Close this modal after clicking
                   }}
                   disabled // Disabled for now as requested
                   className="flex-1"
                 >
                   <Video className="h-4 w-4 mr-2" /> Schedule Video Call
                 </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}