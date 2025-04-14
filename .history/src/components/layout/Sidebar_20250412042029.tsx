// src/components/layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronRight,
  Settings, // Icon for Super Admin
  FolderKanban, // Icon for Directory
  Wrench, // Icon for Visa Builder
  Bot, // Icon for Automation Hub
  FileText, // Icon for sub-items like Login, Audit Trail, etc.
  UserCog, // Icon for Admins
  UsersRound, // Icon for Users
  Building, // Icon for Departments
  Group, // Icon for Teams
  Network, // Icon for Groups
  KeyRound, // Icon for Authentication
  Lock, // Icon for Access Controls
  ClipboardList, // Icon for Permissions
  Gavel, // Icon for Rules
  BookCheck, // Icon for Compliance
  BookOpen, // Icon for Guides & Resources
  Plug, // Icon for APIs & Integrations
  CircleDot, // Existing icon
  CheckCircle, // Existing icon
  BrainCircuit, // Icon for AI & ML
  GalleryVerticalEnd, // Icon for Visual Builder
  DatabaseZap, // Icon for Visa Database
  Library, // Icon for Visa Knowledgebase
  FlaskConical, // Icon for AI Analysis Tools
  FilePlus, // Icon for New Visa Types
  FileCheck, // Icon for Published Visa Types
  Tags, // Icon for Visa Categories
  Puzzle, // Icon for Visa Components
} from 'lucide-react'; // Import necessary icons

// Define the structure for navigation items, including optional sub-items
type NavItem = {
  href?: string; // Optional for parent items that only toggle
  label: string;
  icon: React.ElementType;
  subItems?: NavItem[];
  // Function to check if the item or its children are active
  isActive?: (pathname: string, itemHref?: string, subItems?: NavItem[]) => boolean;
};

// Helper function to check active state, including sub-items
const checkActive = (pathname: string, itemHref?: string, subItems?: NavItem[]): boolean => {
  // Direct match
  if (itemHref && pathname === itemHref) {
    return true;
  }
  // Check if any sub-item is active
  if (subItems) {
    return subItems.some(sub => checkActive(pathname, sub.href, sub.subItems));
  }
  // Handle cases where the parent path might match a child route
  // Ensure itemHref is not just '/' to avoid matching everything
  if (itemHref && itemHref !== '/' && pathname.startsWith(itemHref + '/')) {
      return true;
  }
  return false;
};

// --- Define navItems BEFORE the component ---
const navItems: NavItem[] = [
    { href: '/home', label: 'Home', icon: Home, isActive: checkActive },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: checkActive },
    {
      label: 'Super Admin', icon: Settings, isActive: checkActive, href: '/super-admin', subItems: [
        { href: '/super-admin/login', label: 'Login', icon: FileText, isActive: checkActive },
        { href: '/super-admin/audit-trail', label: 'Audit Trail', icon: FileText, isActive: checkActive },
      ]
    },
    {
      label: 'Directory', icon: FolderKanban, isActive: checkActive, href: '/directory', subItems: [
        { href: '/directory/admins', label: 'Admins', icon: UserCog, isActive: checkActive },
        { href: '/directory/users', label: 'Users', icon: UsersRound, isActive: checkActive },
        { href: '/directory/departments', label: 'Departments', icon: Building, isActive: checkActive },
        { href: '/directory/teams', label: 'Teams', icon: Group, isActive: checkActive },
        { href: '/directory/groups', label: 'Groups', icon: Network, isActive: checkActive },
      ]
    },
    {
      label: 'Visa Builder', icon: Wrench, isActive: checkActive, href: '/visa-builder', subItems: [
        { href: '/visa-builder', label: 'Visa Builder Tool', icon: Wrench, isActive: checkActive },
        { href: '/visa-builder/new-list', label: 'New Visa Types', icon: FilePlus, isActive: checkActive },
        { href: '/visa-builder/published-list', label: 'Published Visa Types', icon: FileCheck, isActive: checkActive },
        { href: '/visa-builder/categories', label: 'Visa Categories', icon: Tags, isActive: checkActive },
        { href: '/visa-builder/components', label: 'Visa Components', icon: Puzzle, isActive: checkActive },
        { href: '/visa-builder/database', label: 'Visa database', icon: DatabaseZap, isActive: checkActive },
        { href: '/visa-builder/knowledgebase', label: 'Visa Knowledgebase', icon: Library, isActive: checkActive },
        { href: '/visa-builder/ai-analysis', label: 'AI Analysis Tools', icon: FlaskConical, isActive: checkActive },
      ]
    },
    {
      label: 'Automation Hub', icon: Bot, isActive: checkActive, href: '/automation-hub', subItems: [
        { href: '/automation-hub/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: checkActive },
        { href: '/automation-hub/visual-builder', label: 'Visual Builder', icon: GalleryVerticalEnd, isActive: checkActive },
        { href: '/automation-hub/ai-ml', label: 'AI & Machine Learning', icon: BrainCircuit, isActive: checkActive },
        { href: '/automation-hub/api-integrations', label: 'API Integrations', icon: Plug, isActive: checkActive },
      ]
    },
    {
      label: 'Security', icon: ShieldCheck, isActive: checkActive, href: '/security', subItems: [
        { href: '/security/authentication', label: 'Authentication', icon: KeyRound, isActive: checkActive },
        { href: '/security/access-controls', label: 'Access Controls', icon: Lock, isActive: checkActive },
        { href: '/security/permissions', label: 'Permissions', icon: ClipboardList, isActive: checkActive },
        { href: '/security/rules', label: 'Rules', icon: Gavel, isActive: checkActive },
      ]
    },
    {
      label: 'Data', icon: Database, isActive: checkActive, href: '/data', subItems: [
        { href: '/data/compliance', label: 'Compliance', icon: BookCheck, isActive: checkActive },
        { href: '/data/guides-resources', label: 'Guides & Resources', icon: BookOpen, isActive: checkActive },
        { href: '/data/apis-integrations', label: 'APIs & Integrations', icon: Plug, isActive: checkActive },
      ]
    },
];
// --- End of navItems definition ---

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Initialize open sections based on active path
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initialOpenState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems && checkActive(pathname, item.href, item.subItems)) {
        initialOpenState[item.label] = true;
      }
    });
    return initialOpenState;
  });

  // Function to toggle section visibility
  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Recursive function to render navigation items
  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = item.isActive ? item.isActive(pathname, item.href, item.subItems) : false;
      const isOpen = openSections[item.label] ?? isActive; // Default to open if active

      // Define common classes
      const baseClasses = "flex w-full items-center gap-3 rounded-lg py-2 px-3 text-left text-sm transition-all duration-150 ease-in-out";
      const hoverClasses = "hover:bg-gray-100 hover:text-gray-900"; // Standard hover
      const defaultClasses = "text-gray-600"; // Slightly darker default text
      const activeClasses = "bg-gray-200 text-gray-600"; // New active style

      if (item.subItems) {
        // --- Render parent item (button) ---
        return (
          <div key={item.label} className="px-3 py-1">
            <button
              onClick={() => toggleSection(item.label)}
              className={`${baseClasses} ${isActive ? activeClasses : `${defaultClasses} ${hoverClasses}`}`}
            >
              {/* --- Icon Styling Updated --- */}
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-1">{item.label}</span>
              {/* --- Chevron Styling Updated --- */}
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'} ${isActive ? 'text-blue-100' : 'text-gray-400'}`} />
            </button>
            {/* Render sub-items */}
            <div
              className={`mt-1 ml-4 pl-3 border-l border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-screen' : 'max-h-0'
              }`}
              style={{ maxHeight: isOpen ? `${item.subItems.length * 40}px` : '0' }}
            >
                {renderNavItems(item.subItems, true)}
            </div>
          </div>
        );
      } else {
        // --- Render regular link item ---
        return (
          <Link
            key={item.href}
            href={item.href!}
            // --- Link Classes Updated ---
            className={`${baseClasses} ${isSubmenu ? 'ml-3' : 'mx-3'} ${ // Use margin for top-level, margin-left for sub-items
                isActive ? activeClasses : `${defaultClasses} ${hoverClasses}`
            }`}
          >
            {/* --- Icon Styling Updated --- */}
            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            {item.label}
          </Link>
        );
      }
    });
  };

  return (
    <aside className="hidden border-r bg-white md:block w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col"> {/* Removed gap-2 for tighter control */}
        {/* === Sidebar Header === */}
        <div className="flex h-[60px] items-center border-b px-4">
           <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="relative h-8 w-8 mr-2">
                  <Image
                    src="/logo/ov_logo.png"
                    alt="OpenVisa Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 drop-shadow-sm">
                  AMS
                </h1>
              </Link>
            </div>
        </div>
        {/* === End of Sidebar Header === */}

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 sidebar-scroll">
          {/* --- Nav Structure Updated --- */}
          <nav className="flex flex-col gap-1 text-sm font-medium"> {/* Use flex-col for better spacing control */}
            {renderNavItems(navItems)}
          </nav>
        </div>

      </div>
      {/* Scrollbar styling */}
      <style jsx global>{`
        .sidebar-scroll::-webkit-scrollbar {
            width: 6px; height: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #e5e7eb; border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #d1d5db;
        }
        .sidebar-scroll {
          scrollbar-width: thin; scrollbar-color: #e5e7eb transparent;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
