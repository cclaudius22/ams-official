// src/components/onboarding/configurator/ConfiguratorHeader.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  X, 
  RotateCcw, 
  Eye, 
  ChevronLeft, 
  Pencil,
  Laptop
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner';

const ConfiguratorHeader = () => {
  const { state, dispatch } = useConfigurator();
  const router = useRouter();
  const { configuration, isLoading, isModified } = state;
  const isEditing = !!configuration.id;
  
  const handleSave = async () => {
    console.log("Saving configuration:", configuration);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (isEditing) {
        await new Promise(resolve => setTimeout(resolve, 700));
        toast.success("Configuration updated (Mock)");
        dispatch({ type: 'MARK_MODIFIED', payload: false });
      } else {
        await new Promise(resolve => setTimeout(resolve, 700));
        const savedConfig = { ...configuration, id: `new-${Date.now()}`};
        toast.success("Configuration created (Mock)");
        router.replace(`/nexus-onboard/configurator?id=${savedConfig.id}`);
        dispatch({ type: 'LOAD_CONFIG', payload: savedConfig });
      }
    } catch (error) {
      toast.error("Error Saving", { 
        description: error.message || "Could not save configuration." 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCancel = () => {
    if (isModified) {
      toast.warning("Discard unsaved changes?", {
        action: { 
          label: "Discard", 
          onClick: () => router.push('/nexus-onboard/configurations') 
        },
        cancel: { label: "Keep Editing" },
        duration: 10000,
      });
    } else {
      router.push('/nexus-onboard/configurations');
    }
  };

  const handleReset = () => {
    const message = isEditing
      ? "Reset changes back to last saved state?"
      : "Clear form and start over?";

    toast.warning("Confirm Reset", {
      description: message,
      action: { 
        label: "Yes, Reset", 
        onClick: () => {/* reset logic */} 
      },
      cancel: { label: "No" },
      duration: 10000,
    });
  };

  const togglePreview = () => {
    // Implementation for preview toggle
    alert("Preview toggle to be implemented. It will likely switch to the Preview tab.");
  }

  return (
    <div className="flex flex-col border-b bg-white">
      {/* Top navigation row with back button */}
      <div className="flex items-center px-4 py-2 text-sm text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mr-2 px-2" 
          onClick={() => router.push('/nexus-onboard/configurations')}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to configurations</span>
        </Button>
        
        <Separator orientation="vertical" className="h-4 mx-2" />
        
        {isEditing && (
          <>
            <span className="text-xs flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5" />
              {`${configuration.targetUserType || 'All'} / ${configuration.targetOrgType || 'All'}`}
            </span>
            <Separator orientation="vertical" className="h-4 mx-2" />
            <span className="text-xs">v{configuration.version || 1}</span>
            {configuration.isActive && (
              <>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <Badge 
                  variant="outline" 
                  className="text-xs py-0 h-5 font-normal border-green-200 bg-green-50 text-green-700"
                >
                  Active
                </Badge>
              </>
            )}
          </>
        )}
        
        <div className="flex-1"></div>
        
        {/* Status indicator */}
        {isModified && (
          <Badge variant="outline" className="text-xs py-0 h-5 font-normal border-orange-200 bg-orange-50 text-orange-700">
            Unsaved Changes
          </Badge>
        )}
      </div>
      
      {/* Main header row */}
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Left Side: Title */}
        <div className="flex-shrink min-w-0">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-semibold truncate text-gray-800" 
                title={isEditing ? configuration.name : 'Create New Configuration'}>
              {isEditing ? configuration.name || 'Untitled' : 'Create Onboarding Configuration'}
            </h1>
            {isEditing && (
              <Button variant="ghost" size="sm" className="ml-2 h-7 w-7 p-0" title="Edit Name">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
          {configuration.key && (
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {configuration.key}
            </p>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center flex-shrink-0 space-x-2 md:space-x-3 ml-auto">
          <TooltipProvider delayDuration={300}>
            {/* Reset Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isLoading || !isModified}
                  className={`text-muted-foreground hover:text-foreground ${!isModified ? 'opacity-50' : ''}`}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Reset</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isEditing ? 'Reset to saved state' : 'Clear all fields'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Cancel Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Cancel</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exit configurator</p>
              </TooltipContent>
            </Tooltip>

            {/* Preview Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  disabled={isLoading}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                >
                  <Eye className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Preview</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview onboarding flow</p>
              </TooltipContent>
            </Tooltip>

            {/* Save Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading || !isModified}
                  className="bg-green-600 hover:bg-green-700 px-3 md:px-4"
                >
                  <Save className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">
                    {isLoading ? 'Saving...' : (isEditing ? 'Save' : 'Create')}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isModified ? 'Save changes' : 'No changes to save'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHeader;