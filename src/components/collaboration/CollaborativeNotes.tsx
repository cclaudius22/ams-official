'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  PlusCircle,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface CollaborativeNotesProps {
  applicationId: string;
  sectionId: string;
}

// Mock note data
const mockNotes = [
  {
    id: 'note-1',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    content: 'The passport expiration date is less than 6 months from the intended travel date. This needs to be flagged.',
    createdAt: '2025-10-03T14:30:00Z',
    author: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    },
    category: 'concern',
    resolved: false
  },
  {
    id: 'note-2',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    content: 'I\'ve verified the passport details against the external database and they match.',
    createdAt: '2025-10-03T15:45:00Z',
    author: {
      id: 'user-2',
      name: 'Mike Fitzgerald',
      role: 'Officer',
      avatar: null
    },
    category: 'verification',
    resolved: true
  },
  {
    id: 'note-3',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    content: 'Has anyone checked if this passport has been reported stolen? @Uma Mirza can you verify?',
    createdAt: '2025-10-04T09:15:00Z',
    author: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    },
    category: 'question',
    resolved: false
  }
];

// Note category badge component
const NoteCategoryBadge = ({ category }: { category: string }) => {
  const categoryMap: Record<string, { label: string, icon: React.ReactNode, className: string }> = {
    question: { 
      label: 'Question', 
      icon: <HelpCircle className="h-3 w-3" />, 
      className: 'bg-blue-100 text-blue-800' 
    },
    concern: { 
      label: 'Concern', 
      icon: <AlertCircle className="h-3 w-3" />, 
      className: 'bg-red-100 text-red-800' 
    },
    verification: { 
      label: 'Verification', 
      icon: <CheckCircle className="h-3 w-3" />, 
      className: 'bg-green-100 text-green-800' 
    },
    general: { 
      label: 'General', 
      icon: <Info className="h-3 w-3" />, 
      className: 'bg-gray-100 text-gray-800' 
    }
  };
  
  const categoryInfo = categoryMap[category] || categoryMap.general;
  
  return (
    <Badge className={`${categoryInfo.className} flex items-center gap-1 font-normal`}>
      {categoryInfo.icon}
      {categoryInfo.label}
    </Badge>
  );
};

export default function CollaborativeNotes({ applicationId, sectionId }: CollaborativeNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  // Filter notes for this application and section
  const filteredNotes = mockNotes.filter(
    note => note.applicationId === applicationId && note.sectionId === sectionId
  );

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    // In a real implementation, this would call an API to add the note
    console.log('Adding note:', { applicationId, sectionId, content: newNote, category: selectedCategory });
    
    // Reset form
    setNewNote('');
    setSelectedCategory('general');
    
    // For demo purposes, we could add to the mock data
    alert('Note added! (This would be saved to the database in a real implementation)');
  };

  return (
    <div className="space-y-6">
      {/* Add new note form */}
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add a Note
        </h3>
        
        <Textarea
          placeholder="Type your note here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[100px]"
        />
        
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2">Category:</span>
          {Object.entries({
            general: { label: 'General', icon: <Info className="h-3 w-3" /> },
            question: { label: 'Question', icon: <HelpCircle className="h-3 w-3" /> },
            concern: { label: 'Concern', icon: <AlertCircle className="h-3 w-3" /> },
            verification: { label: 'Verification', icon: <CheckCircle className="h-3 w-3" /> }
          }).map(([key, { label, icon }]) => (
            <Button
              key={key}
              type="button"
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setSelectedCategory(key)}
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleAddNote}
            disabled={!newNote.trim()}
          >
            Add Note
          </Button>
        </div>
      </div>
      
      {/* Notes list */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes ({filteredNotes.length})
        </h3>
        
        {filteredNotes.length > 0 ? (
          <div className="space-y-4">
            {filteredNotes.map(note => (
              <div key={note.id} className="bg-white border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={note.author.avatar || undefined} alt={note.author.name} />
                      <AvatarFallback>
                        {note.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{note.author.name}</div>
                      <div className="text-xs text-gray-500">{note.author.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <NoteCategoryBadge category={note.category} />
                    {note.resolved && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                  
                  <div className="flex gap-2">
                    {!note.resolved && (
                      <Button variant="outline" size="sm">
                        Mark as Resolved
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>No notes for this section yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
