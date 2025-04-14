// src/components/onboarding/configurator/FieldTypeCard.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner';
import { FieldComponentDefinition } from './types';

interface FieldTypeCardProps {
  componentDef: FieldComponentDefinition;
}

const FieldTypeCard: React.FC<FieldTypeCardProps> = ({ componentDef }) => {
  const { state, dispatch } = useConfigurator();
  const { activeStepId } = state;
  
  const handleAddToStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!activeStepId) {
      toast.error("No step selected", { 
        description: "Please select a step before adding fields."
      });
      return;
    }
    
    dispatch({
      type: 'ADD_FIELD',
      payload: {
        stepId: activeStepId,
        fieldType: componentDef.id
      }
    });
    
    toast.success(`Added ${componentDef.name}`, { 
      description: "Field added to the current step."
    });
  };
  
  return (
    <Card 
      className="border hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all"
      onClick={handleAddToStep}
    >
      <div className="p-3">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            {React.createElement(componentDef.icon, { className: "h-4 w-4" })}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{componentDef.name}</div>
            <div className="text-xs text-muted-foreground">{componentDef.description}</div>
          </div>
        </div>
        
        <div className="mt-2 p-2 bg-muted/20 rounded border border-border/50">
          {componentDef.preview}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={handleAddToStep}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Add to Step
        </Button>
      </div>
    </Card>
  );
};

export default FieldTypeCard;