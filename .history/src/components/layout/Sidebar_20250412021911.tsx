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


  // Define navigation items with the new structure
  const navItems: NavItem[] = [
    { href: '/home', label: 'Home', icon: Home, isActive: checkActive },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: checkActive },
    {
      label: 'Super Admin', icon: Settings, isActive: checkActive, href: '/super-admin', subItems: [ // Added base href for parent active check
        { href: '/super-admin/login', label: 'Login', icon: FileText, isActive: checkActive },
        { href: '/super-admin/audit-trail', label: 'Audit Trail', icon: FileText, isActive: checkActive },
      ]
    },
    {
      label: 'Directory', icon: FolderKanban, isActive: checkActive, href: '/directory', subItems: [ // Added base href
        { href: '/directory/admins', label: 'Admins', icon: UserCog, isActive: checkActive },
        { href: '/directory/users', label: 'Users', icon: UsersRound, isActive: checkActive },
        { href: '/directory/departments', label: 'Departments', icon: Building, isActive: checkActive },
        { href: '/directory/teams', label: 'Teams', icon: Group, isActive: checkActive },
        { href: '/directory/groups', label: 'Groups', icon: Network, isActive: checkActive },
      ]
    },
    {
      label: 'Visa Builder', icon: Wrench, isActive: checkActive, href: '/visa-builder', subItems: [ // Added base href
         // Keep existing Visa Builder items, map them to new structure
        { href: '/visa-builder/tool', label: 'Visa Builder Tool', icon: Wrench, isActive: checkActive }, // Assuming a dedicated tool page
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
      label: 'Automation Hub', icon: Bot, isActive: checkActive, href: '/automation-hub', subItems: [ // Added base href
        { href: '/automation-hub/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: checkActive },
        { href: '/automation-hub/visual-builder', label: 'Visual Builder', icon: GalleryVerticalEnd, isActive: checkActive },
        { href: '/automation-hub/ai-ml', label: 'AI & Machine Learning', icon: BrainCircuit, isActive: checkActive },
        { href: '/automation-hub/api-integrations', label: 'API Integrations', icon: Plug, isActive: checkActive },
      ]
    },
    {
      label: 'Security', icon: ShieldCheck, isActive: checkActive, href: '/security', subItems: [ // Added base href
        { href: '/security/authentication', label: 'Authentication', icon: KeyRound, isActive: checkActive },
        { href: '/security/access-controls', label: 'Access Controls', icon: Lock, isActive: checkActive },
        { href: '/security/permissions', label: 'Permissions', icon: ClipboardList, isActive: checkActive },
        { href: '/security/rules', label: 'Rules', icon: Gavel, isActive: checkActive },
      ]
    },
    {
      label: 'Data', icon: Database, isActive: checkActive, href: '/data', subItems: [ // Added base href
        { href: '/data/compliance', label: 'Compliance', icon: BookCheck, isActive: checkActive },
        { href: '/data/guides-resources', label: 'Guides & Resources', icon: BookOpen, isActive: checkActive },
        { href: '/data/apis-integrations', label: 'APIs & Integrations', icon: Plug, isActive: checkActive },
      ]
    },
    // Add other top-level items if needed
  ];

  // Function to toggle section visibility
  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Recursive function to render navigation items
  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const Icon = item.icon;
      // Check if the item or any of its children are active
      const isActive = item.isActive ? item.isActive(pathname, item.href, item.subItems) : false;
      // Section is open if explicitly toggled OR if it's active and hasn't been explicitly closed
      const isOpen = openSections[item.label] ?? isActive; // Default to open if active

      if (item.subItems) {
        // Render parent item (clickable div to toggle)
        return (
          <div key={item.label} className="px-3 py-1"> {/* Adjusted padding for parent */}
            <button
              onClick={() => toggleSection(item.label)}
              // Add specific background/text color if parent itself is the active path (e.g., /directory)
              className={`flex w-full items-center gap-3 rounded-lg py-2 px-3 text-left text-sm transition-all hover:bg-gray-100 hover:text-gray-900 ${
                 (isActive && !item.subItems.some(sub => sub.href === pathname)) || (item.href && pathname === item.href) // Highlight parent if it's the direct target or contains active child
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : isActive ? 'text-gray-900 font-medium' : 'text-gray-500' // Slightly less emphasis if only child is active
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-gray-800' : 'text-gray-400'}`} />
              <span className="flex-1">{item.label}</span>
              {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </button>
            {/* Render sub-items if open - using conditional rendering & CSS for transition */}
            <div
              className={`mt-1 ml-4 pl-3 border-l border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-screen' : 'max-h-0' // Control visibility and animate height
              }`}
              style={{ maxHeight: isOpen ? `${item.subItems.length * 40}px` : '0' }} // Estimate max height for smooth transition
            >
                {renderNavItems(item.subItems, true)}
            </div>
          </div>
        );
      } else {
        // Render regular link item
        return (
          <Link
            key={item.href}
            href={item.href!} // Assert href exists for non-parent items
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-gray-900 ${
              isSubmenu ? 'pl-6' : 'pl-3' // Indent sub-items more
            } ${
              isActive
                ? 'bg-gray-100 text-gray-900 font-semibold' // Highlight active link
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-gray-800' : 'text-gray-400'}`} />
            {item.label}
          </Link>
        );
      }
    });
  };

  return (
    <aside className="hidden border-r bg-white md:block w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* === Sidebar Header Updated === */}
        <div className="flex h-[60px] items-center border-b px-4"> {/* Adjusted padding slightly */}
           {/* Use the structure provided by the user */}
           <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="relative h-8 w-8 mr-2"> {/* Adjusted size and margin */}
                  <Image
                    src="/logo/ov_logo.png" // Make sure this path is correct in your public folder
                    alt="OpenVisa Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Added sizes prop for optimization
                    className="object-contain"
                    priority // Add priority if it's LCP
                  />
                </div>
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 drop-shadow-sm"> {/* Adjusted text size */}
                  AMS
                </h1>
              </Link>
            </div>
        </div>
        {/* === End of Sidebar Header Update === */}

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 sidebar-scroll"> {/* Added custom scrollbar class */}
          <nav className="grid items-start gap-1 text-sm font-medium"> {/* Removed px-4, handled by item padding */}
            {renderNavItems(navItems)}
          </nav>
        </div>
        {/* Optional Footer Area */}
        {/* <div className="mt-auto p-4 border-t">
          <p className="text-xs text-gray-500">© 2025</p>
        </div> */}
      </div>
      {/* Add basic scrollbar styling */}
      <style jsx global>{`
        .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #e5e7eb; /* gray-200 */
            border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #d1d5db; /* gray-300 */
        }
        /* For Firefox */
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
