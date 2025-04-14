// src/components/onboarding/configurator/FieldTypeCard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext'; // Changed path assuming context is one level up
import { toast } from 'sonner';
import { FieldComponentDefinition } from './types';

interface FieldTypeCardProps {
  componentDef: FieldComponentDefinition;
}

const FieldTypeCard = ({ componentDef }: FieldTypeCardProps) => {
  const { state, dispatch } = useConfigurator();
  const { activeStepId } = state;
  const Icon = componentDef.icon; // Get the icon component

  const handleAddField = () => {
    if (!activeStepId) {
      toast({
        title: 'No Step Selected',
        description: 'Please select a step from the left panel first to add a field.',
        variant: 'destructive',
      });
      return;
    }
    dispatch({ type: 'ADD_FIELD', payload: { stepId: activeStepId, fieldType: componentDef.id } });
    toast({
       title: `Field Added`,
       description: `"${componentDef.name}" added to the current step.`,
       // className: "bg-green-100 border-green-300 text-green-800", // Optional styling
    });
  };

  return (
    // Card provides structure, border, background
    <Card className="overflow-hidden group hover:border-primary/40 transition-colors bg-white">
      {/* Header for Icon and Title */}
      <CardHeader className="p-3 pb-1">
         <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <CardTitle className="text-sm font-medium leading-tight">{componentDef.name}</CardTitle>
         </div>
         {/* Optional: Add description back if needed
         <CardDescription className="text-xs pt-1">{componentDef.description}</CardDescription> */}
      </CardHeader>
      {/* Content area for the preview */}
      <CardContent className="p-3 pt-1">
        <div className="p-2 bg-slate-100 rounded border border-slate-200 h-[60px] flex items-center justify-center text-xs text-muted-foreground">
          {/* Render the JSX preview defined in AVAILABLE_FIELD_COMPONENTS */}
          {componentDef.preview}
        </div>
      </CardContent>
      {/* Footer for the action button */}
      <CardFooter className="p-3 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs" // Adjusted size and text size
          onClick={handleAddField}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add to Step
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FieldTypeCard;