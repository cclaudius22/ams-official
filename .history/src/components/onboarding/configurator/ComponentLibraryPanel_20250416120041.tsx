// src/components/onboarding/configurator/ComponentLibraryPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search } from 'lucide-react';

import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner';
import { FieldComponentDefinition } from './types';

// Import the registry functions
import { getAllFieldTypes, getFieldTypesByCategory } from '../registry/fieldTypeRegistry';

// Define field categories with their colors for gradients
const FIELD_CATEGORIES = [
  { id: 'basic', name: 'Basic', color: 'from-blue-50 to-blue-100', textColor: 'text-blue-600', iconColor: 'text-blue-500' },
  { id: 'identity', name: 'Identity', color: 'from-purple-50 to-purple-100', textColor: 'text-purple-600', iconColor: 'text-purple-500' },
  { id: 'document', name: 'Document', color: 'from-amber-50 to-amber-100', textColor: 'text-amber-600', iconColor: 'text-amber-500' },
  { id: 'advanced', name: 'Advanced', color: 'from-emerald-50 to-emerald-100', textColor: 'text-emerald-600', iconColor: 'text-emerald-500' }
];

// Get category details by ID
const getCategoryDetails = (categoryId) => {
  return FIELD_CATEGORIES.find(cat => cat.id === categoryId) || FIELD_CATEGORIES[0];
};

// Simple component for "Add to Step" button
const AddToStepButton = ({ componentId, componentName }) => {
  const { state, dispatch } = useConfigurator();
  const { activeStepId } = state;
  
  const handleClick = () => {
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
        fieldType: componentId
      }
    });
    
    toast.success(`Added ${componentName}`, { 
      description: "Field added to the current step."
    });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="h-7 px-2" 
      onClick={handleClick}
    >
      <Plus className="h-3.5 w-3.5 mr-1" />
      Add
    </Button>
  );
};

// Component card that uses registry field type
const ComponentCard = ({ fieldType }) => {
  const Icon = fieldType.icon;
  const categoryDetails = getCategoryDetails(fieldType.category);
  
  return (
    <Card className={`overflow-hidden border mb-2 shadow-sm bg-gradient-to-br ${categoryDetails.color} hover:shadow-md transition-shadow`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${categoryDetails.iconColor}`} />
            <div className="font-medium text-sm">{fieldType.name}</div>
          </div>
          <AddToStepButton 
            componentId={fieldType.id} 
            componentName={fieldType.name} 
          />
        </div>
        
        <div className="text-xs text-muted-foreground mb-2">
          {fieldType.description}
        </div>
        
        <div className="border rounded-md bg-white/80 p-2">
          <div className="transform scale-90 origin-top-left">
            {/* For now, we can use a simple preview placeholder */}
            <div className="h-12 flex items-center justify-center text-sm text-muted-foreground">
              {fieldType.name} Preview
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Custom category pill component
const CategoryPill = ({ value, label, count, isActive, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs ${
        isActive 
          ? 'bg-primary-foreground/20 text-primary-foreground' 
          : 'bg-background text-muted-foreground'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// --- Component Definition ---
const ComponentLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [fieldTypes, setFieldTypes] = useState([]);
  
  // Load field types from registry
  useEffect(() => {
    const allTypes = getAllFieldTypes();
    setFieldTypes(allTypes);
  }, []);
  
  // Filter field components by search term and category
  const filteredComponents = fieldTypes.filter(component => {
    const matchesSearch = searchTerm === '' || 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'All' || 
      activeCategory.toLowerCase() === component.category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Count components by category
  const allCount = fieldTypes.length;
  const basicCount = fieldTypes.filter(c => c.category === 'basic').length;
  const identityCount = fieldTypes.filter(c => c.category === 'identity').length;
  const documentCount = fieldTypes.filter(c => c.category === 'document').length;
  const advancedCount = fieldTypes.filter(c => c.category === 'advanced').length;
  
  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Category Pills */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
        <CategoryPill 
          value="All" 
          label="All" 
          count={allCount} 
          isActive={activeCategory === 'All'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="Basic" 
          label="Basic" 
          count={basicCount} 
          isActive={activeCategory === 'Basic'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="Identity" 
          label="Identity" 
          count={identityCount} 
          isActive={activeCategory === 'Identity'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="Document" 
          label="Document" 
          count={documentCount} 
          isActive={activeCategory === 'Document'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="Advanced" 
          label="Advanced" 
          count={advancedCount} 
          isActive={activeCategory === 'Advanced'} 
          onClick={setActiveCategory} 
        />
      </div>
      
      {/* Component Grid */}
      <ScrollArea className="flex-1 p-4 pt-0">
        {filteredComponents.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredComponents.map(fieldType => (
              <ComponentCard
                key={fieldType.id}
                fieldType={fieldType}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              {fieldTypes.length > 0 
                ? "No components match your search" 
                : "Loading components..."}
            </p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ComponentLibraryPanel;