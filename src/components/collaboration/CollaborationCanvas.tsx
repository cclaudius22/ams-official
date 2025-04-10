'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Users,
  PlusCircle,
  Pencil
} from 'lucide-react';
import CollaborativeNotes from './CollaborativeNotes';
import TaskAssignmentPanel from './TaskAssignmentPanel';
import TeamMembersList from './TeamMembersList';
import ActivityTimeline from './ActivityTimeline';

interface CollaborationCanvasProps {
  applicationId: string;
  applicationData?: any; // Replace with proper type
}

export default function CollaborationCanvas({ applicationId, applicationData }: CollaborationCanvasProps) {
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Mock sections for demonstration
  const sections = [
    { id: 'passport', name: 'Passport Information' },
    { id: 'financial', name: 'Financial Information' },
    { id: 'travel', name: 'Travel Details' },
    { id: 'visas', name: 'Existing Visas' },
    { id: 'documents', name: 'Required Documents' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Application sections */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {sections.map(section => (
                  <button
                    key={section.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedSection === section.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{section.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">3 notes</Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">1 task</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Collaboration tools */}
        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-lg">
                  {selectedSection 
                    ? `Collaborating on: ${sections.find(s => s.id === selectedSection)?.name}` 
                    : 'Select a section to collaborate'}
                </CardTitle>
                {selectedSection && (
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit Section
                  </Button>
                )}
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="notes" className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Notes</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="pt-6">
              {!selectedSection ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Select a section from the left to start collaborating</p>
                  <p className="text-sm text-gray-400">You can add notes, assign tasks, and work with your team</p>
                </div>
              ) : (
                <>
                  <TabsContent value="notes" className="mt-0">
                    <CollaborativeNotes 
                      applicationId={applicationId} 
                      sectionId={selectedSection} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="mt-0">
                    <TaskAssignmentPanel 
                      applicationId={applicationId} 
                      sectionId={selectedSection} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="team" className="mt-0">
                    <TeamMembersList 
                      applicationId={applicationId} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0">
                    <ActivityTimeline 
                      applicationId={applicationId} 
                      sectionId={selectedSection} 
                    />
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
