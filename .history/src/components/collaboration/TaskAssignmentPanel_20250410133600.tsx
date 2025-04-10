'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface TaskAssignmentPanelProps {
  applicationId: string;
  sectionId: string;
}

// Mock task data
const mockTasks = [
  {
    id: 'task-1',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    title: 'Verify passport against external database',
    description: 'Check if the passport details match the records in the external database.',
    status: 'completed',
    priority: 'high',
    dueDate: '2025-10-04',
    assignedTo: {
      id: 'user-2',
      name: 'Mike Fitzgerald',
      role: 'Officer',
      avatar: null
    },
    assignedBy: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    },
    createdAt: '2025-10-03T14:30:00Z',
    completedAt: '2025-10-03T16:45:00Z'
  },
  {
    id: 'task-2',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    title: 'Check if passport has been reported stolen',
    description: 'Verify with the international database if this passport has been reported as stolen or lost.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-10-05',
    assignedTo: {
      id: 'user-3',
      name: 'Uma Mirza',
      role: 'Visa History Specialist',
      avatar: null
    },
    assignedBy: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    },
    createdAt: '2025-10-04T09:30:00Z',
    completedAt: null
  }
];

// Mock team members for assignment
const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    role: 'Senior Visa Officer',
    avatar: null
  },
  {
    id: 'user-2',
    name: 'Mike Fitzgerald',
    role: 'Officer',
    avatar: null
  },
  {
    id: 'user-3',
    name: 'Uma Mirza',
    role: 'Visa History Specialist',
    avatar: null
  },
  {
    id: 'user-4',
    name: 'David Chen',
    role: 'Financial Verification Specialist',
    avatar: null
  }
];

// Task status badge component
const TaskStatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string, icon: React.ReactNode, className: string }> = {
    pending: { 
      label: 'Pending', 
      icon: <Clock className="h-3 w-3" />, 
      className: 'bg-yellow-100 text-yellow-800' 
    },
    in_progress: { 
      label: 'In Progress', 
      icon: <Clock className="h-3 w-3" />, 
      className: 'bg-blue-100 text-blue-800' 
    },
    completed: { 
      label: 'Completed', 
      icon: <CheckCircle className="h-3 w-3" />, 
      className: 'bg-green-100 text-green-800' 
    },
    blocked: { 
      label: 'Blocked', 
      icon: <AlertCircle className="h-3 w-3" />, 
      className: 'bg-red-100 text-red-800' 
    }
  };
  
  const statusInfo = statusMap[status] || statusMap.pending;
  
  return (
    <Badge className={`${statusInfo.className} flex items-center gap-1 font-normal`}>
      {statusInfo.icon}
      {statusInfo.label}
    </Badge>
  );
};

// Priority indicator component
const PriorityIndicator = ({ priority }: { priority: string }) => {
  const priorityMap: Record<string, { color: string, label: string }> = {
    high: { color: 'bg-red-500', label: 'High Priority' },
    medium: { color: 'bg-yellow-500', label: 'Medium Priority' },
    low: { color: 'bg-green-500', label: 'Low Priority' }
  };
  
  const priorityInfo = priorityMap[priority] || { color: 'bg-gray-500', label: 'Unknown Priority' };
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2.5 w-2.5 rounded-full ${priorityInfo.color}`} title={priorityInfo.label} />
      <span className="text-xs text-gray-500">{priorityInfo.label}</span>
    </div>
  );
};

export default function TaskAssignmentPanel({ applicationId, sectionId }: TaskAssignmentPanelProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  
  // Filter tasks for this application and section
  const filteredTasks = mockTasks.filter(
    task => task.applicationId === applicationId && task.sectionId === sectionId
  );

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskAssignee || !newTaskDueDate) return;
    
    // In a real implementation, this would call an API to add the task
    console.log('Adding task:', { 
      applicationId, 
      sectionId, 
      title: newTaskTitle,
      description: newTaskDescription,
      assignedTo: newTaskAssignee,
      priority: newTaskPriority,
      dueDate: newTaskDueDate
    });
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskAssignee('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setShowNewTaskForm(false);
    
    // For demo purposes
    alert('Task added! (This would be saved to the database in a real implementation)');
  };

  return (
    <div className="space-y-6">
      {/* Tasks list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({filteredTasks.length})
          </h3>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            {showNewTaskForm ? 'Cancel' : 'New Task'}
          </Button>
        </div>
        
        {/* New task form */}
        {showNewTaskForm && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
            <h4 className="font-medium">Create New Task</h4>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Title</div>
              <Input
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <Textarea
                placeholder="Task description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Assign To</div>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  required
                >
                  <option value="">Select team member</option>
                  {mockTeamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Due Date</div>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Priority</div>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(priority => (
                  <Button
                    key={priority}
                    type="button"
                    variant={newTaskPriority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTaskPriority(priority)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !newTaskAssignee || !newTaskDueDate}
              >
                Create Task
              </Button>
            </div>
          </div>
        )}
        
        {/* Tasks list */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-white border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <PriorityIndicator priority={task.priority} />
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                
                <div className="flex flex-wrap justify-between items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Assigned to:</span>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignedTo.avatar || undefined} alt={task.assignedTo.name} />
                          <AvatarFallback className="text-[10px]">
                            {task.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{task.assignedTo.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    
                    {task.status !== 'completed' ? (
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Mark Complete
                      </Button>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Completed: {new Date(task.completedAt!).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>No tasks for this section yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
