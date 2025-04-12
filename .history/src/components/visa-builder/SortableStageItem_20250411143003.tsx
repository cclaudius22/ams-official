// src/components/visa-builder/SortableStageItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Grip, FileText } from 'lucide-react'; // Assuming FileText is needed as default
import { Stage } from './interfaces'; // Import the Stage interface

interface SortableStageItemProps {
  stage: Stage;
  toggleStage: (id: string) => void;
}

const SortableStageItem = ({ stage, toggleStage }: SortableStageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging // You might use this for styling while dragging
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Example: Make item semi-transparent while dragging
    zIndex: isDragging ? 10 : 'auto', // Ensure dragging item is on top
  };

  // Ensure the icon is a valid component before rendering, provide a default
  const IconComponent = stage.icon || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-colors duration-150 ${
        stage.enabled ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-500'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Left side: Drag Handle, Icon, Name */}
      <div className="flex items-center flex-grow min-w-0"> {/* Added min-w-0 */}
        <div {...attributes} {...listeners} className="mr-2 cursor-grab touch-none p-1"> {/* Added touch-none and padding */}
          <Grip className="h-5 w-5 text-gray-400" />
        </div>
        <IconComponent className={`h-5 w-5 mr-2 flex-shrink-0 ${
          stage.enabled ? 'text-blue-600' : 'text-gray-400'
        }`} />
        <span className={`font-medium text-sm truncate ${stage.enabled ? 'text-gray-800' : 'text-gray-500'}`}>
          {stage.name}
        </span>
      </div>

      {/* Right side: Enable/Disable Button */}
      <div className="flex-shrink-0 self-start sm:self-center ml-auto pl-2"> {/* Ensure button doesn't wrap unnecessarily */}
        <Button
          variant={stage.enabled ? "default" : "outline"}
          size="sm"
          className="text-xs px-3 h-8" // Adjusted padding/height
          onClick={() => toggleStage(stage.id)}
          type="button" // Add type="button"
        >
          {stage.enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
    </div>
  );
};

// Make sure to export the component!
export default SortableStageItem;