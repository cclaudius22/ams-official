'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
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
  const [localFilters, setLocalFilters] = useState<LiveQueueFilters>(filters)

  if (!isOpen) return null

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
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <Card className="w-80 h-full rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto h-[calc(100vh-140px)]">
          <div className="space-y-6">
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
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('country', country)}
                  >
                    {country.toUpperCase()}
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
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}