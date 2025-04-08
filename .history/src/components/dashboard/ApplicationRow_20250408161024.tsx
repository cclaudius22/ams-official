// src/components/dashboard/ApplicationRow.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge'; // For status badge
import { LiveApplication } from '@/types/liveQueue'; // Import the type
import { cn } from '@/lib/utils'; // For conditional classes
import { formatDate } from '@/utils/formatters'; // Import date formatter

interface ApplicationRowProps {
  application: LiveApplication;
  isSelected: boolean;
  onCheckboxChange: (id: string) => void;
  onSelect?: (application: LiveApplication) => void; // Optional: If clicking row does something
}

// Helper function for status badge styling (can be refined)
const getStatusBadgeClass = (status: LiveApplication['status']) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Rejected':
    case 'Escalated': // Treat escalated as negative/warning for now
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Pending Assignment':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'In Progress':
    case 'Awaiting Info':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};


export default function ApplicationRow({
  application,
  isSelected,
  onCheckboxChange,
  onSelect // Destructure onSelect prop
}: ApplicationRowProps) {

  const handleRowClick = () => {
    if (onSelect) {
        onSelect(application); // Call onSelect if provided when row is clicked
    }
  };

  // Prevent row click from triggering when checkbox is clicked
  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
     e.stopPropagation(); // Stop click event from bubbling up to the row
     onCheckboxChange(application.id);
  }

  return (
    <tr
        className={`border-b border-gray-200 hover:bg-gray-50 ${onSelect ? 'cursor-pointer' : ''}`} // Add hover and cursor if onSelect is provided
        onClick={handleRowClick} // Add row click handler
        >
      {/* Checkbox Cell */}
      <td className="py-3 px-4 w-12"> {/* Consistent width with header */}
        <div className="flex items-center justify-center">
           <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={isSelected}
              onChange={() => onCheckboxChange(application.id)} // Trigger handler directly
              onClick={handleCheckboxClick} // Stop propagation on checkbox click
              aria-label={`Select application ${application.id}`}
            />
        </div>
      </td>

      {/* ID Cell */}
      <td className="py-3 px-4">
        <span className="font-mono text-xs font-medium text-gray-700">{application.id}</span>
      </td>

      {/* Applicant Cell */}
      <td className="py-3 px-4">
        <span className="font-medium text-gray-900">{application.applicantName}</span>
        <p className="text-xs text-gray-500">{application.country}</p> {/* Added country */}
      </td>

      {/* Visa Details Cell */}
      <td className="py-3 px-4">
        <span className="text-gray-800">{application.visaType}</span>
        {/* Optional: Add category if exists */}
        {/* {application.category && <p className="text-xs text-gray-500">{application.category}</p>} */}
      </td>

      {/* Submitted Date Cell */}
      <td className="py-3 px-4 text-gray-600" suppressHydrationWarning>
        {formatDate(application.submittedDate, { year: 'numeric', month: 'short', day: 'numeric' })} {/* Use short date format */}
      </td>

      {/* Status Cell */}
      <td className="py-3 px-4">
        <Badge variant="outline" className={`text-xs capitalize ${getStatusBadgeClass(application.status)}`}>
          {application.status}
        </Badge>
      </td>

      {/* Assigned To Cell */}
      <td className="py-3 px-4 text-gray-600">
        {application.assignedTo ? application.assignedTo.name : <span className="text-gray-400 italic">Unassigned</span>}
      </td>

       {/* Optional: Actions Cell (for view/edit buttons per row) */}
       {/* <td className="py-3 px-4 text-right">
           <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onSelect?.(application); }}>View</Button>
       </td> */}
    </tr>
  );
}