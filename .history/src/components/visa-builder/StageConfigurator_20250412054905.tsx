// src/components/visa-builder/StageConfigurator.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming Select component
import { Lock, Unlock, Grip, FileText } from 'lucide-react'; // Added Grip
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent, // Import DragEndEvent type
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import SortableStageItem from './SortableStageItem'; // Import the item component
import { Stage } from './interfaces'; // Assuming interfaces are in a separate file or defined above/imported

interface StageConfiguratorProps {
  fixedStages: Stage[];
  conditionalStages: Stage[]; // The full list for state management
  finalStages: Stage[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  visaCategories: string[];
  toggleStage: (id: string) => void;
  handleDragEnd: (event: DragEndEvent) => void; // Use specific type
  sensors: ReturnType<typeof useSensors>; // Pass down sensors
}

const StageConfigurator: React.FC<StageConfiguratorProps> = ({
  fixedStages,
  conditionalStages,
  finalStages,
  selectedCategory,
  setSelectedCategory,
  visaCategories,
  toggleStage,
  handleDragEnd,
  sensors, // Receive sensors as props
}) => {

  // Filter conditional stages based on the selected category for rendering
  const filteredConditionalStages = conditionalStages.filter(stage =>
    !stage.categories || stage.categories.includes(selectedCategory)
  );

  // Get IDs of the filtered stages for SortableContext
  const filteredConditionalStageIds = filteredConditionalStages.map(stage => stage.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">2. Application Flow Builder</CardTitle>
        <p className="text-xs text-gray-500">Define the steps applicant follows.</p>
      </CardHeader>
      <CardContent>
        {/* --- Fixed Stages --- */}
        <div className="mb-6">
          <h3 className="font-medium mb-2 flex items-center text-sm text-gray-700">
            <Lock className="h-4 w-4 mr-2 text-gray-400" />
            Fixed Stages (Always Required)
          </h3>
          <div className="space-y-2">
            {fixedStages.map((stage) => {
              const IconComponent = stage.icon || FileText; // Default icon
              return (
                <div
                  key={stage.id}
                  className="border rounded-md p-3 bg-blue-50 text-gray-700 flex items-center text-sm"
                >
                  <IconComponent className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span>{stage.name}</span>
                  {/* Optional: Add a small indicator */}
                  {/* <span className="ml-auto text-xs text-blue-500">(Fixed)</span> */}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Conditional Stages --- */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <h3 className="font-medium flex items-center text-base text-gray-700">
              <Unlock className="h-4 w-4 mr-2 text-gray-400" />
              Conditional Stages (Enable/Disable & Reorder)
            </h3>
            {/* Category Selector */}
            <div className="w-full sm:w-52">
               <Label htmlFor="visaCategory" className="sr-only">Select Visa Category</Label>
               <Select
                 value={selectedCategory}
                 onValueChange={(value) => setSelectedCategory(value)}

               >
                 <SelectTrigger id="visaCategory" className="w-full text-sm">
                   <SelectValue placeholder="Select Visa Category" />
                 </SelectTrigger>
                 <SelectContent>
                   {visaCategories.map(category => (
                     <SelectItem key={category} value={category} className="text-sm">
                       {category} Visa
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Only stages relevant to the selected category are shown. Drag <Grip className="h-3 w-3 inline-block align-text-bottom" /> to reorder.
          </p>

          {/* Drag and Drop Area */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd} // Use the handler passed from parent
          >
            <SortableContext
              items={filteredConditionalStageIds} // Use IDs of FILTERED stages
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredConditionalStages.map((stage) => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    toggleStage={toggleStage} // Pass toggle function down
                  />
                ))}
                 {filteredConditionalStages.length === 0 && (
                   <p className="text-sm text-gray-400 italic text-center py-4">No conditional stages available for this category.</p>
                 )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

      </CardContent>
    </Card>
  );
};

export default StageConfigurator;
