// app/knowledgebase/page.tsx
'use client';

import { useState } from 'react';
import { RAGChat } from '@/app/dashboard/knowledgebase/RAGChat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Book, BookOpen, History, Star } from 'lucide-react';

// Quick links data
const quickLinks = [
  { title: 'Visa Types Overview', category: 'Guides' },
  { title: 'Document Requirements', category: 'Requirements' },
  { title: 'Processing Times', category: 'Information' },
  { title: 'Fee Structure', category: 'Information' },
  { title: 'Security Checks', category: 'Procedures' },
  { title: 'Appeals Process', category: 'Procedures' }
];

export default function KnowledgebasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Section */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-9"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <div>
                    <p className="text-sm font-medium">{link.title}</p>
                    <p className="text-xs text-gray-500">{link.category}</p>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              {/* Featured Topics */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Suggested Topics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Visa Application Process',
                    'Required Documents',
                    'Processing Times',
                    'Fee Structure'
                  ].map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-3"
                    >
                      <Book className="h-4 w-4 mr-2 text-gray-500" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>

              {/* RAG Chat Component */}
              <RAGChat />
            </TabsContent>

            <TabsContent value="saved">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No saved items yet</h3>
                  <p className="text-sm">
                    Start saving useful articles and responses for quick access
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No recent history</h3>
                  <p className="text-sm">
                    Your search and chat history will appear here
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}