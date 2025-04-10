// src/components/dashboard/SidebarNavigation.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const NavSection: React.FC<NavSectionProps> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <div 
        className="flex items-center px-3 py-2 cursor-pointer text-gray-800 hover:text-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 mr-2">
          <img src={icon} alt={title} className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
        <svg 
          className={`ml-auto w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="mt-1 ml-2">
          {children}
        </div>
      )}
    </div>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  children, 
  badge, 
  badgeColor = 'text-gray-800 bg-gray-100', 
  active = false 
}) => {
  const activeClass = active 
    ? "border-l-2 border-blue-600 text-blue-600" 
    : "text-gray-700 hover:text-blue-600 hover:border-l-2 hover:border-blue-600";

  return (
    <Link 
      href={href}
      className={`flex items-center p-1.5 pl-3 text-sm ${activeClass}`}
    >
      <span>{children}</span>
      {badge && (
        <span className={`ml-auto ${badgeColor} px-1.5 py-0.5 rounded text-xs`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

export default function SidebarNavigation() {
  return (
    <div className="w-64 bg-white border-r h-screen overflow-y-auto">
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
        
        {/* Live Dashboard Section */}
        <NavSection title="Live Dashboard" icon="/icons/data.svg">
          <NavLink href="/dashboard/livequeue">Live Queue</NavLink>
          <NavLink href="/dashboard/live-intelligence">Live Intelligence</NavLink>
        </NavSection>

        <div className="my-2 border-t" />
        
        {/* Visa Processing Section */}
        <NavSection title="Visa Processing" icon="/icons/visa.svg">
          <NavLink href="/dashboard/reviewer" active={true} badge="23">My Queue</NavLink>
          <NavLink href="#" badge="12">Pending</NavLink>
          <NavLink href="#">Completed</NavLink>
          <NavLink href="#" badge="3" badgeColor="text-red-600 bg-gray-100">Escalated</NavLink>
          <NavLink href="#">Decisions</NavLink>
        </NavSection>

        <div className="my-2 border-t" />
        
        {/* Tools & Integrations Section */}
        <NavSection title="Tools & Integrations" icon="/icons/tools.svg">
          <NavLink href="/dashboard/tools/verification">Verification Tools</NavLink>
          <NavLink href="#">Visa Base</NavLink>
          <NavLink href="#">AI Tools</NavLink>
          <NavLink href="#">Knowledgebase</NavLink>
        </NavSection>

        <div className="my-2 border-t" />
        
        {/* Teams Section */}
        <NavSection title="Teams" icon="/icons/teams.svg">
          <NavLink href="#">Team 1</NavLink>
          <NavLink href="#">Team 2</NavLink>
          <NavLink href="#">Team 3</NavLink>
          <NavLink href="#">Collaboration</NavLink>
          <NavLink href="#" badge="4" badgeColor="text-blue-600 bg-gray-100">Messages</NavLink>
        </NavSection>

        <div className="my-2 border-t" />
        
        {/* Settings Section */}
        <NavSection title="Settings" icon="/icons/settings.svg" defaultOpen={false}>
          <NavLink href="#">Access Permissions</NavLink>
          <NavLink href="#">Security Settings</NavLink>
        </NavSection>
      </div>
    </div>
  );
}