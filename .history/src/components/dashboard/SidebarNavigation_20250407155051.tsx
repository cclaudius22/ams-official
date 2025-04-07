// src/components/dashboard/SidebarNavigation.tsx
import React from 'react'

export default function SidebarNavigation() {
  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6 p-2 bg-blue-50 rounded-lg">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            RJ
          </div>
          <div>
            <h3 className="font-medium">Rachel Johnson</h3>
            <p className="text-sm text-blue-600">Senior Visa Officer</p>
          </div>
        </div>
        
        {/* Main Navigation - Atlas Style */}
        <nav className="space-y-0">
          <a href="#" className="flex items-center p-1.5 border-l-2 border-blue-600 text-blue-600 pl-3 text-sm font-medium">
            <span>My Queue</span>
            <span className="ml-auto bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs">23</span>
          </a>
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Pending Reviews</span>
            <span className="ml-auto bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs">12</span>
          </a>
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Completed</span>
          </a>
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Escalated Cases</span>
            <span className="ml-auto bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-xs">3</span>
          </a>
        </nav>

        <div className="my-4 border-t" />

        {/* Tools Section */}
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 pl-3">Tools</h3>
        <nav className="space-y-0">
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Verification Tools</span>
          </a>
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Security Checks</span>
          </a>
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Recent Checks</span>
          </a>
        </nav>

        <div className="my-4 border-t" />

        {/* Team Section */}
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 pl-3">Team</h3>
        <nav className="space-y-0">
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Office Team</span>
          </a>
          <a href="#" className="flex items-center p-1.5 text-gray-700 hover:text-blue-600 pl-3 text-sm hover:border-l-2 hover:border-blue-600">
            <span>Messages</span>
            <span className="ml-auto bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-xs">4</span>
          </a>
        </nav>
      </div>
    </div>
  );
}