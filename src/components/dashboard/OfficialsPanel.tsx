'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConsulateOfficial } from '@/types/liveQueue'
import { User } from 'lucide-react'

interface OfficialsPanelProps {
  officials: ConsulateOfficial[]
  onAssignApplication?: (officialId: string) => void
  activeTab?: string
}

export default function OfficialsPanel({ 
  officials, 
  onAssignApplication,
  activeTab = 'today' 
}: OfficialsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Consulate Officials</CardTitle>
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
            <TabsTrigger value="thisWeek" className="text-xs">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
          {officials.map(official => (
            <div 
              key={official.id}
              className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onAssignApplication && onAssignApplication(official.id)}
            >
              <div className="flex items-center">
                {official.avatar ? (
                  <img 
                    src={official.avatar} 
                    alt={official.name} 
                    className="h-8 w-8 rounded-full mr-3" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{official.name}</p>
                  {official.role && <p className="text-xs text-gray-500">{official.role}</p>}
                </div>
              </div>
              <div className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                {official.activeApplications}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}