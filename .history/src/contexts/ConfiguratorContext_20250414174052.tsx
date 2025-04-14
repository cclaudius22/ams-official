// src/contexts/ConfiguratorContext.tsx
'use client';

import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { OnboardingConfiguration, StepConfig, FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path if needed

// --- State Definition ---
export interface ConfiguratorState {
  configuration: OnboardingConfiguration;
  activeStepId: string | null; // ID of the step currently being edited
  isLoading: boolean;          // For async operations like loading/saving
  isModified: boolean;         // Track unsaved changes
  // Potentially add state for currently selected field for settings later
  // selectedFieldId: string | null;
}

// --- Initial State ---
const initialStepId = `step-${Date.now()}`; // Generate unique ID for the initial step
export const initialConfiguration: OnboardingConfiguration = {
  name: '',
  key: '',
  targetUserType: 'employee', // Default value
  targetOrgType: 'all',       // Default value
  version: 1,
  isActive: false,
  securityLevel: 'standard', // Default value
  steps: [
    {
      id: initialStepId,
      title: 'Step 1',
      description: 'Initial step description',
      order: 0,
      fields: []
    }
  ]
};

const initialState: ConfiguratorState = {
  configuration: initialConfiguration,
  activeStepId: initialStepId, // Start with the first step active
  isLoading: false,
  isModified: false,
};

// --- Action Definitions ---
export type ConfiguratorAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CONFIG'; payload: OnboardingConfiguration } // Load existing config
  | { type: 'RESET_CONFIG' } // Reset to initial state for creating new
  | { type: 'UPDATE_CONFIG_DETAIL'; payload: { field: keyof OnboardingConfiguration; value: any } }
  | { type: 'SET_ACTIVE_STEP'; payload: string | null }
  | { type: 'ADD_STEP' }
  | { type: 'DELETE_STEP'; payload: { stepId: string } }
  | { type: 'UPDATE_STEP'; payload: { stepId: string; updates: Partial<StepConfig> } } // For title/desc
  | { type: 'ADD_FIELD'; payload: { stepId: string; fieldType: string; /* Pass more defaults later */ } }
  | { type: 'DELETE_FIELD'; payload: { stepId: string; fieldId: string } }
  // Add actions for REORDER_STEPS, REORDER_FIELDS, UPDATE_FIELD later
  | { type: 'MARK_MODIFIED' }; // Simple action to mark changes

// --- Reducer ---
function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction): ConfiguratorState {
  // console.log("ACTION:", action.type, action.payload); // Good for debugging
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_CONFIG': {
      const loadedConfig = action.payload;
      // Ensure steps and fields have order if not provided by backend
      const stepsWithOrder = loadedConfig.steps.map((step, index) => ({
          ...step,
          order: step.order ?? index,
          fields: (step.fields || []).map((field, fieldIndex) => ({
              ...field,
              order: field.order ?? fieldIndex,
          }))
      })).sort((a, b) => a.order - b.order); // Sort steps by order

      const firstStepId = stepsWithOrder.length > 0 ? stepsWithOrder[0].id : null;
      return {
        ...state,
        configuration: { ...loadedConfig, steps: stepsWithOrder },
        activeStepId: firstStepId, // Activate first step on load
        isModified: false,
        isLoading: false,
      };
    }

    case 'RESET_CONFIG':
      const newInitialStepId = `step-${Date.now() + 1}`;
      return {
        ...initialState, // Use a fresh initial state
        configuration: { // Generate new initial config with unique ID
            ...initialState.configuration,
             steps: [{ ...initialState.configuration.steps[0], id: newInitialStepId }]
        },
        activeStepId: newInitialStepId,
      };

    case 'UPDATE_CONFIG_DETAIL':
      // Avoid direct mutation
      const updatedConfiguration = {
        ...state.configuration,
        [action.payload.field]: action.payload.value,
      };
      return {
        ...state,
        configuration: updatedConfiguration,
        isModified: true,
      };

    case 'SET_ACTIVE_STEP':
      return { ...state, activeStepId: action.payload };

    case 'ADD_STEP': {
      const newOrder = state.configuration.steps.length;
      const newStep: StepConfig = {
        id: `step-${Date.now()}`,
        title: `Step ${newOrder + 1}`,
        description: '',
        order: newOrder,
        fields: [],
      };
      return {
        ...state,
        configuration: {
          ...state.configuration,
          steps: [...state.configuration.steps, newStep],
        },
        activeStepId: newStep.id, // Activate the new step
        isModified: true,
      };
    }

    case 'DELETE_STEP': {
        const { stepId } = action.payload;
        if (state.configuration.steps.length <= 1) return state; // Cannot delete the last step

        const remainingSteps = state.configuration.steps
            .filter(step => step.id !== stepId)
            // Re-order remaining steps
            .map((step, index) => ({ ...step, order: index }));

        let nextActiveStepId = state.activeStepId;
        if (state.activeStepId === stepId) {
            // Basic logic: activate the first remaining step
            nextActiveStepId = remainingSteps.length > 0 ? remainingSteps[0].id : null;
        }

        return {
            ...state,
            configuration: { ...state.configuration, steps: remainingSteps },
            activeStepId: nextActiveStepId,
            isModified: true,
        };
    }

    case 'UPDATE_STEP': {
      const { stepId, updates } = action.payload;
      return {
          ...state,
          configuration: {
              ...state.configuration,
              steps: state.configuration.steps.map(step =>
                  step.id === stepId ? { ...step, ...updates } : step
              ),
          },
          isModified: true,
      };
    }

    case 'ADD_FIELD': {
      const { stepId, fieldType } = action.payload;
      const stepIndex = state.configuration.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return state; // Step not found

      const currentStep = state.configuration.steps[stepIndex];
      const newFieldOrder = currentStep.fields.length;

      const newField: FieldConfig = {
          id: `field-${Date.now()}`,
          type: fieldType,
          label: `New ${fieldType} Field`, // Placeholder label
          fieldName: `${fieldType}_${newFieldOrder + 1}`, // Basic unique name - NEEDS IMPROVEMENT
          isRequired: false,
          order: newFieldOrder,
          // Add other default properties based on fieldType later
      };

      // Create a new steps array with the updated step
      const updatedSteps = state.configuration.steps.map((step, index) => {
          if (index === stepIndex) {
              return {
                  ...step,
                  fields: [...step.fields, newField]
              };
          }
          return step;
      });

      return {
          ...state,
          configuration: { ...state.configuration, steps: updatedSteps },
          isModified: true,
      };
    }

     case 'DELETE_FIELD': {
         const { stepId, fieldId } = action.payload;
         const stepIndex = state.configuration.steps.findIndex(s => s.id === stepId);
         if (stepIndex === -1) return state;

         const updatedSteps = state.configuration.steps.map((step, index) => {
            if (index === stepIndex) {
                const remainingFields = step.fields
                    .filter(field => field.id !== fieldId)
                    // Re-order remaining fields
                    .map((field, fieldIndex) => ({ ...field, order: fieldIndex }));
                return { ...step, fields: remainingFields };
            }
            return step;
         });

         return {
             ...state,
             configuration: { ...state.configuration, steps: updatedSteps },
             isModified: true,
         };
     }

     case 'MARK_MODIFIED':
        return { ...state, isModified: true };

    default:
      // Uncomment below line to enforce handling all actions
      // const exhaustiveCheck: never = action;
      return state;
  }
}

// --- Context Definition ---
const ConfiguratorContext = createContext<{ state: ConfiguratorState; dispatch: Dispatch<ConfiguratorAction> } | undefined>(undefined);

// --- Provider Component ---
export const ConfiguratorProvider = ({ children, initialConfig }: { children: ReactNode, initialConfig?: OnboardingConfiguration }) => {
  const [state, dispatch] = useReducer(configuratorReducer, initialState);

  // Effect to load initialConfig if provided (e.g., when editing)
  React.useEffect(() => {
    if (initialConfig) {
      dispatch({ type: 'LOAD_CONFIG', payload: initialConfig });
    } else {
        // Ensure a fresh state if no initialConfig (e.g., creating new)
        dispatch({ type: 'RESET_CONFIG' });
    }
  }, [initialConfig]); // Dependency array ensures this runs once when initialConfig is available/changes

  return (
    <ConfiguratorContext.Provider value={{ state, dispatch }}>
      {children}
    </ConfiguratorContext.Provider>
  );
};

// --- Custom Hook ---
export const useConfigurator = () => {
  const context = useContext(ConfiguratorContext);
  if (context === undefined) {
    throw new Error('useConfigurator must be used within a ConfiguratorProvider');
  }
  return context;
};