// src/components/onboarding/configurator/StepsListPanel.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  LayoutList, 
  GripVertical, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileStack,
  FlaskConical
} from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableStepItem from './SortableStepItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Updated SortableStepItem with improved styling
const EnhancedSortableStepItem = ({ step, isActive }) => {
  const { dispatch } = useConfigurator();
  
  // Get counts for fields in this step
  const fieldCount = step.fields?.length || 0;
  const requiredFieldCount = step.fields?.filter(f => f.isRequired)?.length || 0;
  
  const handleSelectStep = () => {
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step.id });
  };
  
  // Determine if step has content
  const isEmpty = fieldCount === 0;
  
  // Get status indicator based on fields
  const getStatusIndicator = () => {
    if (isEmpty) {
      return (
        <div className="h-5 w-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="h-3 w-3 text-amber-500" />
        </div>
      );
    }
    
    return (
      <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      </div>
    );
  };
  
  return (
    <div 
      className={`group relative pl-3 pr-2 py-2.5 rounded-md border mb-2 transition-all cursor-pointer ${
        isActive
          ? 'bg-primary/5 border-primary/30'
          : 'hover:bg-accent/20 border-border'
      }`}
      onClick={handleSelectStep}
    >
      {/* Drag handle absolute positioned on the left */}
      <div className="absolute left-0.5 top-0 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div 
          className="w-5 h-full flex items-center justify-center cursor-grab text-muted-foreground hover:text-foreground"
          data-no-dnd-area="true"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      
      <div className="flex items-center">
        {/* Status indicator */}
        <div className="flex-shrink-0 mr-2">
          {getStatusIndicator()}
        </div>
        
        {/* Step info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="font-medium truncate">{step.title || 'Untitled Step'}</div>
            
            {/* Field count badge */}
            {fieldCount > 0 && (
              <Badge 
                variant="outline" 
                className={`ml-2 px-1 py-0 h-4 text-[10px] ${
                  isActive 
                    ? 'bg-primary/10 border-primary/20 text-primary' 
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
              </Badge>
            )}
          </div>
          
          {/* Very subtle description if exists */}
          {step.description && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {step.description}
            </div>
          )}
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <ChevronRight className="h-4 w-4 ml-2 text-primary" />
        )}
      </div>
    </div>
  );
};

const StepsListPanel = () => {
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;
  
  // Create an array of step IDs for SortableContext
  const stepIds = React.useMemo(() => 
    configuration.steps.map(s => s.id), 
    [configuration.steps]
  );
  
  const handleAddStep = () => {
    dispatch({ type: 'ADD_STEP' });
  };
  
  // Count completed steps (has at least one field)
  const completedSteps = configuration.steps.filter(step => 
    (step.fields?.length || 0) > 0
  ).length;
  
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-3 border-b bg-muted/10">
        <div className="flex items-center gap-2 mb-2">
          <FileStack className="h-4 w-4 text-primary" />
          <h2 className="font-medium">Workflow Steps</h2>
        </div>
        
        {/* Progress indicator */}
        {configuration.steps.length > 0 && (
          <div className="flex items-center mt-2">
            <div className="flex-1">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ 
                    width: `${configuration.steps.length > 0 
                      ? (completedSteps / configuration.steps.length) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              {completedSteps}/{configuration.steps.length}
            </span>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Steps list with dnd */}
          <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
            {configuration.steps.length > 0 ? (
              configuration.steps.map((step) => (
                <EnhancedSortableStepItem
                  key={step.id}
                  step={step}
                  isActive={step.id === activeStepId}
                />
              ))
            ) : (
              <div className="text-center py-8 px-2">
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1">Start your workflow</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Create your first step to begin building your onboarding flow.
                </p>
                <Button
                  size="sm"
                  onClick={handleAddStep}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add First Step
                </Button>
              </div>
            )}
          </SortableContext>
        </div>
      </ScrollArea>
      
      {configuration.steps.length > 0 && (
        <div className="p-3 border-t bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddStep}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Step
          </Button>
        </div>
      )}
    </div>
  );
};

export default StepsListPanel;