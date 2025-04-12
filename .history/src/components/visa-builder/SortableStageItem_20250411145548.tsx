// src/components/visa-builder/SortableStageItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Grip, FileText } from 'lucide-react'; // Default icon
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
    isDragging
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  // Use the actual icon component passed in props, or default to FileText
  const IconComponent = stage.icon || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-colors duration-150 ${
        stage.enabled ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-500'
      } ${isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''}`} // Added ring on drag
    >
      {/* Left side: Drag Handle, Icon, Name */}
      <div className="flex items-center flex-grow min-w-0">
        {/* Ensure listeners are only on the handle */}
        <button
          {...attributes}
          {...listeners}
          type="button" // Add type="button"
          className="mr-2 cursor-grab touch-none p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400" // Improved focus style
          aria-label={`Drag ${stage.name}`} // Added aria-label
        >
          <Grip className="h-5 w-5 text-gray-400" />
        </button>
        <IconComponent className={`h-5 w-5 mr-2 flex-shrink-0 ${
          stage.enabled ? 'text-blue-600' : 'text-gray-400'
        }`} />
        <span className={`font-medium text-sm truncate ${stage.enabled ? 'text-gray-800' : 'text-gray-500'}`}>
          {stage.name}
        </span>
      </div>

      {/* Right side: Enable/Disable Button */}
      <div className="flex-shrink-0 self-start sm:self-center sm:ml-auto pl-0 sm:pl-2 mt-2 sm:mt-0"> {/* Adjusted margin/padding */}
        <Button
          variant={stage.enabled ? "default" : "outline"}
          size="sm"
          className="text-xs px-3 h-8"
          onClick={() => toggleStage(stage.id)}
          type="button"
        >
          {stage.enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
    </div>
  );
};

export default SortableStageItem;