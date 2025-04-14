// src/contexts/ConfiguratorContext.tsx
'use client';

import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useMemo } from 'react';
import { arrayMove } from '@dnd-kit/sortable'; // Import arrayMove utility
import { OnboardingConfiguration, StepConfig, FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path if needed
// Import the definitions if needed within the reducer (e.g., for default values on ADD_FIELD)
import { AVAILABLE_FIELD_COMPONENTS } from '@/components/onboarding/configurator/ComponentLibraryPanel'; // Adjust path if needed

// --- State Definition ---
export interface ConfiguratorState {
  configuration: OnboardingConfiguration;
  activeStepId: string | null;
  isLoading: boolean;
  isModified: boolean;
  // selectedFieldId: string | null; // Uncomment later for Field Settings Modal
}

// --- Initial State ---
const initialStepId = `step-${Date.now()}`;
export const initialConfiguration: OnboardingConfiguration = {
  name: '',
  key: '',
  targetUserType: 'employee',
  targetOrgType: 'all',
  version: 1,
  isActive: false,
  securityLevel: 'standard',
  steps: [
    {
      id: initialStepId,
      title: 'Step 1',
      description: '', // Keep description initially empty
      order: 0,
      fields: []
    }
  ]
};

const initialState: ConfiguratorState = {
  configuration: initialConfiguration,
  activeStepId: initialStepId,
  isLoading: false,
  isModified: false,
};

// --- Action Definitions ---
export type ConfiguratorAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CONFIG'; payload: OnboardingConfiguration }
  | { type: 'RESET_CONFIG' }
  | { type: 'MARK_MODIFIED'; payload?: boolean } // Optional payload to explicitly set modified status
  | { type: 'UPDATE_CONFIG_DETAIL'; payload: { field: keyof OnboardingConfiguration; value: any } }
  | { type: 'SET_ACTIVE_STEP'; payload: string | null }
  | { type: 'ADD_STEP' }
  | { type: 'DELETE_STEP'; payload: { stepId: string } }
  | { type: 'UPDATE_STEP'; payload: { stepId: string; updates: Partial<Pick<StepConfig, 'title' | 'description'>> } } // Only title/desc for now
  | { type: 'REORDER_STEPS'; payload: { activeId: string; overId: string } }
  | { type: 'ADD_FIELD'; payload: { stepId: string; fieldType: string } }
  | { type: 'DELETE_FIELD'; payload: { stepId: string; fieldId: string } }
  | { type: 'REORDER_FIELDS'; payload: { stepId: string; activeId: string; overId: string } }
  | { type: 'UPDATE_FIELD'; payload: { stepId: string; fieldId: string; updates: Partial<FieldConfig> } }; // Add this for Phase 5


// --- Reducer ---
function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction): ConfiguratorState {
   // console.log("ACTION:", action.type, action.payload); // Keep for debugging if needed

  // Helper function to ensure steps and fields have order and arrays exist
  const ensureOrderAndArrays = (config: OnboardingConfiguration): OnboardingConfiguration => {
      const steps = (config.steps || []).map((step, index) => ({
          ...step,
          order: step.order ?? index,
          fields: (step.fields || []).map((field, fieldIndex) => ({
              ...field,
              order: field.order ?? fieldIndex,
          }))
      })).sort((a, b) => a.order - b.order); // Sort steps by order
      return { ...config, steps };
  }

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_CONFIG': {
      const loadedConfig = ensureOrderAndArrays(action.payload);
      const firstStepId = loadedConfig.steps.length > 0 ? loadedConfig.steps[0].id : null;
      return {
        ...state,
        configuration: loadedConfig,
        activeStepId: firstStepId,
        isModified: false, // Reset modified on load
        isLoading: false, // Ensure loading is false after load
      };
    }

    case 'RESET_CONFIG': {
        const newInitialStepId = `step-${Date.now() + 1}`; // Ensure unique ID
        const newInitialConfig = {
             ...initialState.configuration,
              steps: [{ ...initialState.configuration.steps[0], id: newInitialStepId, order: 0 }] // Reset steps correctly
        };
      return {
        ...initialState,
        configuration: newInitialConfig,
        activeStepId: newInitialStepId,
      };
    }

     case 'MARK_MODIFIED':
        // If payload is explicitly false, set it to false, otherwise default to true
        return { ...state, isModified: action.payload === false ? false : true };


    case 'UPDATE_CONFIG_DETAIL':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          [action.payload.field]: action.payload.value,
        },
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
        activeStepId: newStep.id,
        isModified: true,
      };
    }

    case 'DELETE_STEP': {
        const { stepId } = action.payload;
        if (state.configuration.steps.length <= 1) {
            console.warn("Cannot delete the last step.");
            return state;
        }

        const remainingSteps = state.configuration.steps
            .filter(step => step.id !== stepId)
            .map((step, index) => ({ ...step, order: index })); // Re-order

        let nextActiveStepId = state.activeStepId;
        if (state.activeStepId === stepId) {
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

     case 'REORDER_STEPS': {
        const { activeId, overId } = action.payload;
        const oldIndex = state.configuration.steps.findIndex(s => s.id === activeId);
        const newIndex = state.configuration.steps.findIndex(s => s.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            console.warn("Step reorder indices invalid or unchanged.");
            return state;
        }

        const reorderedSteps = arrayMove(state.configuration.steps, oldIndex, newIndex)
            .map((step, index) => ({ ...step, order: index }));

        return {
            ...state,
            configuration: {
                ...state.configuration,
                steps: reorderedSteps,
            },
            isModified: true,
        };
    }


    case 'ADD_FIELD': {
      const { stepId, fieldType } = action.payload;
      const stepIndex = state.configuration.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return state;

      const currentStep = state.configuration.steps[stepIndex];
      const newFieldOrder = currentStep.fields.length;

       // Find component definition to get default label/name
       const componentDef = AVAILABLE_FIELD_COMPONENTS.find(c => c.id === fieldType);
       const defaultLabel = componentDef ? componentDef.name : `New ${fieldType}`;
       // Generate a slightly better default fieldName (still needs improvement/user input)
       const defaultFieldName = `${defaultLabel.toLowerCase().replace(/\s+/g, '_')}_${newFieldOrder + 1}`;


      const newField: FieldConfig = {
          id: `field-${Date.now()}`,
          type: fieldType,
          label: defaultLabel,
          fieldName: defaultFieldName,
          isRequired: false,
          order: newFieldOrder,
          // Add other default properties based on fieldType later
      };

      const updatedSteps = state.configuration.steps.map((step, index) => {
          if (index === stepIndex) {
              return {
                  ...step,
                  fields: [...step.fields, newField] // Add new field immutably
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
                    .map((field, fieldIndex) => ({ ...field, order: fieldIndex })); // Re-assign order
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

    case 'REORDER_FIELDS': {
        const { stepId, activeId, overId } = action.payload;
        const stepIndex = state.configuration.steps.findIndex(s => s.id === stepId);

        if (stepIndex === -1) {
            console.warn(`Step with id ${stepId} not found for field reorder.`);
            return state;
        }

        const currentFields = state.configuration.steps[stepIndex].fields;
        const oldIndex = currentFields.findIndex(f => f.id === activeId);
        const newIndex = currentFields.findIndex(f => f.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            console.warn("Field reorder indices invalid or unchanged.");
            return state;
        }

        const reorderedFields = arrayMove(currentFields, oldIndex, newIndex)
            .map((field, index) => ({ ...field, order: index })); // Update order

        const updatedSteps = state.configuration.steps.map((step, index) => {
            if (index === stepIndex) {
                return { ...step, fields: reorderedFields };
            }
            return step;
        });

        return {
            ...state,
            configuration: {
                ...state.configuration,
                steps: updatedSteps,
            },
            isModified: true,
        };
    }

    case 'UPDATE_FIELD': {
        const { stepId, fieldId, updates } = action.payload;
        const stepIndex = state.configuration.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return state;

        const updatedSteps = state.configuration.steps.map((step, index) => {
            if (index === stepIndex) {
                return {
                    ...step,
                    fields: step.fields.map(field =>
                        field.id === fieldId ? { ...field, ...updates } : field
                    )
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

    default:
       // For unhandled actions, you might throw an error or just return state
       // const _exhaustiveCheck: never = action; // Uncomment for exhaustive checks
      return state;
  }
}

// --- Context Definition ---
const ConfiguratorContext = createContext<{ state: ConfiguratorState; dispatch: Dispatch<ConfiguratorAction> } | undefined>(undefined);

// --- Provider Component ---
export const ConfiguratorProvider = ({ children, initialConfig }: { children: ReactNode, initialConfig?: OnboardingConfiguration }) => {
    // Use initialConfig directly if provided, otherwise use initialState
    // The useEffect logic in ConfiguratorBuilder handles fetching, so the provider just accepts the prop
    const initialReducerState = useMemo(() => { // Now useMemo is recognized
        if (initialConfig) {
            const loadedConfig = ensureOrderAndArrays(initialConfig);
            const firstStepId = loadedConfig.steps.length > 0 ? loadedConfig.steps[0].id : null;
             return {
                 ...initialState, // Start with base initial state
                 configuration: loadedConfig,
                 activeStepId: firstStepId,
                 isModified: false, // Important: initial load is not modified
                 isLoading: false, // Assume loading handled by parent by the time prop arrives
             };
        }
        // If no initialConfig (creating new), return a fresh initial state
         // Ensure a unique initial step ID when creating new via reset logic
          const newInitialStepId = `step-${Date.now() + 1}`;
          const newInitialConfig = {
               ...initialState.configuration,
                steps: [{ ...initialState.configuration.steps[0], id: newInitialStepId, order: 0 }]
          };
        return {
          ...initialState,
          configuration: newInitialConfig,
          activeStepId: newInitialStepId,
        };
    }, [initialConfig]); // Dependency array for useMemo
  
  
    const [state, dispatch] = useReducer(configuratorReducer, initialReducerState);

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