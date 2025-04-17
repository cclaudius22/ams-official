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

// Import the registry functions
import { getAllFieldTypes } from '../registry/fieldTypeRegistry';

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
  const { state, dispatch } = useConfigurator();
  
  // Load field types from registry
  useEffect(() => {
    setFieldTypes(getAllFieldTypes());
  }, []);
  
  // Add field to step
  const handleAddField = (fieldType) => {
    if (!state.activeStepId) {
      toast.error("No step selected", { 
        description: "Please select a step before adding fields."
      });
      return;
    }
    
    dispatch({
      type: 'ADD_FIELD',
      payload: {
        stepId: state.activeStepId,
        fieldType: fieldType.id
      }
    });
    
    toast.success(`Added ${fieldType.name}`, { 
      description: "Field added to the current step."
    });
  };
  
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
  const countByCategory = (category) => {
    return fieldTypes.filter(c => c.category === category).length;
  };
  
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
          count={fieldTypes.length} 
          isActive={activeCategory === 'All'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="basic" 
          label="Basic" 
          count={countByCategory('basic')} 
          isActive={activeCategory === 'basic'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="identity" 
          label="Identity" 
          count={countByCategory('identity')} 
          isActive={activeCategory === 'identity'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="document" 
          label="Document" 
          count={countByCategory('document')} 
          isActive={activeCategory === 'document'} 
          onClick={setActiveCategory} 
        />
        <CategoryPill 
          value="advanced" 
          label="Advanced" 
          count={countByCategory('advanced')} 
          isActive={activeCategory === 'advanced'} 
          onClick={setActiveCategory} 
        />
      </div>
      
      {/* Component Grid */}
      <ScrollArea className="flex-1 p-4 pt-0">
        {filteredComponents.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredComponents.map(fieldType => (
              <Card key={fieldType.id} className="overflow-hidden border mb-2 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {fieldType.icon && <fieldType.icon className="h-4 w-4 text-muted-foreground" />}
                      <div className="font-medium text-sm">{fieldType.name}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 px-2" 
                      onClick={() => handleAddField(fieldType)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    {fieldType.description}
                  </div>
                  
                  <div className="border rounded-md bg-white/80 p-2">
                    <div className="transform scale-90 origin-top-left">
                      {/* Simple text placeholder for now */}
                      <div className="py-2 text-center text-xs text-muted-foreground">
                        {fieldType.name} Preview
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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