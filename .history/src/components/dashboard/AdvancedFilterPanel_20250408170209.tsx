'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import { LiveQueueFilters } from '@/types/liveQueue'

interface AdvancedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: LiveQueueFilters
  onApplyFilters: (filters: LiveQueueFilters) => void
  availableFilters: {
    status: string[]
    visaType: string[]
    country: string[]
    assignedTo: { id: string, name: string }[]
  }
}

export default function AdvancedFilterPanel({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableFilters
}: AdvancedFilterPanelProps) {
  // Initialize localFilters from props, but also update when filters prop changes
  const [localFilters, setLocalFilters] = useState<LiveQueueFilters>(filters)
  
  // Update local filters when the parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle closing with animation
  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 300); // Match this with CSS transition duration
  };

  if (!isOpen && !isAnimating) return null;

  const updateFilter = (filterType: keyof LiveQueueFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const toggleArrayFilter = (filterType: 'status' | 'visaType' | 'country' | 'assignedTo', value: string) => {
    setLocalFilters(prev => {
      const currentArray = prev[filterType] as string[] || []
      const exists = currentArray.includes(value)
      
      return {
        ...prev,
        [filterType]: exists 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      }
    })
  }

  const resetFilters = () => {
    setLocalFilters({
      search: '',
      status: [],
      visaType: [],
      country: [],
      assignedTo: []
    })
  }

  const applyFilters = () => {
    onApplyFilters(localFilters)
    handleClose()
  }

  // Count total active filters
  const activeFiltersCount = Object.values(localFilters)
    .filter(Array.isArray)
    .reduce((count, array) => count + array.length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end overflow-hidden" onClick={handleClose}>
      <div 
        className={`w-80 sm:w-96 transform transition-transform duration-300 ease-in-out ${isAnimating || !isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing
      >
        <Card className="h-full rounded-l-lg rounded-r-none border-r-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-4">
            <div>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="overflow-y-auto p-4 h-[calc(100vh-130px)]">
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <div className="space-y-2">
                  {availableFilters.status.map(status => (
                    <div key={status} className="flex items-center">
                      <Checkbox 
                        id={`status-${status}`} 
                        checked={(localFilters.status || []).includes(status)}
                        onCheckedChange={() => toggleArrayFilter('status', status)}
                      />
                      <label 
                        htmlFor={`status-${status}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Visa Type Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Visa Type</h3>
                <div className="space-y-2">
                  {availableFilters.visaType.map(type => (
                    <div key={type} className="flex items-center">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={(localFilters.visaType || []).includes(type)}
                        onCheckedChange={() => toggleArrayFilter('visaType', type)}
                      />
                      <label 
                        htmlFor={`type-${type}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Country Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Country</h3>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.country.map(country => (
                    <Badge 
                      key={country}
                      variant={(localFilters.country || []).includes(country) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90"
                      onClick={() => toggleArrayFilter('country', country)}
                    >
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Assigned To Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Assigned To</h3>
                <div className="space-y-2">
                  {availableFilters.assignedTo.map(official => (
                    <div key={official.id} className="flex items-center">
                      <Checkbox 
                        id={`official-${official.id}`}
                        checked={(localFilters.assignedTo || []).includes(official.id)}
                        onCheckedChange={() => toggleArrayFilter('assignedTo', official.id)}
                      />
                      <label 
                        htmlFor={`official-${official.id}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {official.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t px-4 py-3">
            <Button variant="outline" onClick={resetFilters} size="sm">
              Reset
            </Button>
            <Button onClick={applyFilters} size="sm">
              Apply {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}