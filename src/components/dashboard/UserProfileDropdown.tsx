'use client';

import React from 'react';
import Link from 'next/link';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Book, 
  HelpCircle, 
  LogOut, 
  MessageSquare, 
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfileDropdownProps {
  userName: string;
  userEmail: string;
  userInitials: string;
}

export default function UserProfileDropdown({ 
  userName, 
  userEmail, 
  userInitials 
}: UserProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
          {userInitials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] p-0 bg-[#1a1f36] border-0 text-white shadow-xl">
        {/* User Profile Section */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-gray-700">
          <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-medium mb-3">
            {userInitials}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">{userName}</h3>
            <p className="text-sm text-gray-400">{userEmail}</p>
          </div>
          <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Manage your Account
          </Button>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <DropdownMenuItem className="px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-indigo-400 cursor-pointer">
            <Book className="mr-3 h-4 w-4 text-indigo-400" />
            <span>Documentation</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-indigo-400 cursor-pointer">
            <HelpCircle className="mr-3 h-4 w-4 text-indigo-400" />
            <span>Support</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-indigo-400 cursor-pointer">
            <MessageSquare className="mr-3 h-4 w-4 text-indigo-400" />
            <span>Give Feedback</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Log Out */}
        <div className="py-2">
          <DropdownMenuItem 
            className="px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-red-400 cursor-pointer"
            onClick={() => console.log('Logging out...')}
          >
            <LogOut className="mr-3 h-4 w-4 text-red-400" />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
