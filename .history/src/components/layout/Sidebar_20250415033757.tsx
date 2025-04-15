// src/components/layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  // Standard Icons
  Home,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronRight,
  Settings,
  FolderKanban,
  Wrench,
  Bot,
  FileText,
  UserCog,
  UsersRound,
  Building,
  Group,
  Network,
  KeyRound,
  Lock,
  ClipboardList, // Used in Security and Nexus Onboard
  Gavel,
  BookCheck,
  BookOpen,      // Used in Data and Nexus Onboard
  Plug,
  CircleDot,
  CheckCircle,
  BrainCircuit,
  GalleryVerticalEnd,
  DatabaseZap,   // Used in Visa Builder
  Library,       // Used in Visa Builder (alternative for KB)
  FlaskConical,
  FilePlus,      // Used in Visa Builder
  FileCheck,     // Used in Visa Builder
  Tags,          // Used in Visa Builder
  Puzzle,        // Used in Visa Builder

  // Icons for Nexus Onboard
  SlidersHorizontal,
  ListChecks,
  // ClipboardList, // Re-used
  // Settings, // Re-used
  // BookOpen, // Re-used
} from 'lucide-react';

type NavItem = {
  href?: string; // Optional for parent items with subItems
  label: string;
  icon: React.ElementType;
  subItems?: NavItem[];
  isActive?: (pathname: string, itemHref?: string, subItems?: NavItem[]) => boolean;
};

// Helper function to check active state, including sub-items
const checkActive = (pathname: string, itemHref?: string, subItems?: NavItem[]): boolean => {
  // Direct match for specific href
  if (itemHref && pathname === itemHref) {
    return true;
  }

  // If it's a parent item, check if the current path starts with the parent's base path
  // Ensure itemHref exists and is not just '/' to avoid overly broad matches
  // Also check if subItems exist to confirm it's a parent intended to group routes
  if (itemHref && itemHref !== '/' && subItems && subItems.length > 0 && pathname.startsWith(itemHref)) {
      // Further check if any sub-item directly matches or if the path is exactly the parent path
      if (pathname === itemHref || subItems.some(sub => sub.href === pathname)) {
         // console.log(`Active parent check: Path ${pathname} starts with ${itemHref}`);
         return true;
      }
      // Optionally, be more lenient and activate parent if *any* child route under it is active
      // This depends on desired UX - sometimes you want the parent active even on deeper nested routes
      // if (pathname.startsWith(itemHref + '/')) return true;
  }

  // Fallback: Check if any sub-item is active recursively (covers cases where parent href might not be set)
  if (subItems) {
    return subItems.some(sub => checkActive(pathname, sub.href, sub.subItems));
  }

  return false;
};


// --- Define Nexus Onboard Navigation Structure ---
const nexusOnboardNav: NavItem = {
  label: 'Nexus Onboard',
  icon: Settings, // Using Settings as the top-level icon
  // Add a base href for parent-level activation check
  href: '/nexus-onboard', // Important for the checkActive logic
  isActive: checkActive,
  subItems: [
    {
      href: '/nexus-onboard/visual-configurator',
      label: 'Onboarding Configurator',
      icon: SlidersHorizontal,
      isActive: checkActive
    },
    {
      href: '/nexus-onboard/configurations',
      label: 'Onboarding Configurations',
      icon: ListChecks,
      isActive: checkActive
    },
    {
      href: '/nexus-onboard/sessions',
      label: 'Onboarding Sessions',
      icon: ClipboardList,
      isActive: checkActive
    },
    {
      href: '/nexus-onboard/knowledgebase',
      label: 'Onboarding Knowledgebase',
      icon: BookOpen,
      isActive: checkActive
    },
  ]
};

// --- Main Navigation Items Array ---
// Update navItems - remove href from parent items with subItems if they don't represent a page themselves
const navItems: NavItem[] = [
    { href: '/home', label: 'Home', icon: Home, isActive: checkActive },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: checkActive },
    {
      // No href for Super Admin parent, it's just a grouping
      label: 'Super Admin', icon: Settings, isActive: checkActive, subItems: [
        { href: '/super-admin/create', label: 'Create', icon: FileText, isActive: checkActive },
        { href: '/super-admin/audit-trail', label: 'Audit Trail', icon: FileText, isActive: checkActive },
      ]
    },
    {
      // No href for Directory parent
      label: 'Directory', icon: FolderKanban, isActive: checkActive, subItems: [
        { href: '/directory/admins', label: 'Admins', icon: UserCog, isActive: checkActive },
        { href: '/directory/users', label: 'Users', icon: UsersRound, isActive: checkActive },
        { href: '/directory/departments', label: 'Departments', icon: Building, isActive: checkActive },
        { href: '/directory/teams', label: 'Teams', icon: Group, isActive: checkActive },
        { href: '/directory/groups', label: 'Groups', icon: Network, isActive: checkActive },
      ]
    },
    // --- Add Nexus Onboard Here ---
    nexusOnboardNav,
    // --- End of Nexus Onboard ---
    {
      // Add base href for Visa Builder parent
      href: '/visa-builder',
      label: 'Visa Builder', icon: Wrench, isActive: checkActive, subItems: [
        // Note: The parent href '/visa-builder' now conflicts with the child tool link.
        // Decide if '/visa-builder' should be the tool OR just the parent group.
        // Option 1: Parent has no href, rely on sub-item activation.
        // Option 2: Rename tool href, e.g., '/visa-builder/tool'. Let's go with Option 2 for clarity.
        { href: '/visa-builder', label: 'Visa Builder Tool', icon: Wrench, isActive: checkActive },
        { href: '/visa-builder/new-list', label: 'New Visa Types', icon: FilePlus, isActive: checkActive },
        { href: '/visa-builder/published-list', label: 'Published Visa Types', icon: FileCheck, isActive: checkActive },
        { href: '/visa-builder/categories', label: 'Visa Categories', icon: Tags, isActive: checkActive },
        { href: '/visa-builder/components', label: 'Visa Components', icon: Puzzle, isActive: checkActive },
        { href: '/visa-builder/database', label: 'Visa database', icon: DatabaseZap, isActive: checkActive },
        { href: '/visa-builder/knowledgebase', label: 'Visa Knowledgebase', icon: Library, isActive: checkActive },
      ]
    },
    {
      // No href for Automation Hub parent
      label: 'Automation Hub', icon: Bot, isActive: checkActive, subItems: [
        { href: '/automation-hub/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: checkActive },
        { href: '/automation-hub/visual-builder', label: 'Visual Builder', icon: GalleryVerticalEnd, isActive: checkActive },
        { href: '/automation-hub/ai-ml', label: 'AI & Machine Learning', icon: BrainCircuit, isActive: checkActive },
        { href: '/automation-hub/api-integrations', label: 'API Integrations', icon: Plug, isActive: checkActive },
      ]
    },
    {
      // No href for Security parent
      label: 'Security', icon: ShieldCheck, isActive: checkActive, subItems: [
        { href: '/security/authentication', label: 'Authentication', icon: KeyRound, isActive: checkActive },
        { href: '/security/access-controls', label: 'Access Controls', icon: Lock, isActive: checkActive },
        { href: '/security/permissions', label: 'Permissions', icon: ClipboardList, isActive: checkActive },
        { href: '/security/rules', label: 'Rules', icon: Gavel, isActive: checkActive },
      ]
    },
    {
      // No href for Data parent
      label: 'Data', icon: Database, isActive: checkActive, subItems: [
        { href: '/data/compliance', label: 'Compliance', icon: BookCheck, isActive: checkActive },
        { href: '/data/guides-resources', label: 'Guides & Resources', icon: BookOpen, isActive: checkActive },
        { href: '/data/apis-integrations', label: 'APIs & Integrations', icon: Plug, isActive: checkActive },
      ]
    },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Initialize open sections based on active path
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initialOpenState: Record<string, boolean> = {};
    navItems.forEach(item => {
      // Ensure isActive check considers the updated logic for parent paths
      if (item.subItems && item.isActive && item.isActive(pathname, item.href, item.subItems)) {
        initialOpenState[item.label] = true;
      }
    });
    return initialOpenState;
  });

  // Function to toggle section visibility
  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Define styling classes
  const mainMenuActiveClasses = "bg-blue-500 text-white";
  const mainMenuHoverClasses = "hover:bg-blue-500 hover:text-white";
  const subMenuActiveClasses = "bg-gray-200 text-gray-600";
  const subMenuHoverClasses = "hover:bg-gray-100 hover:text-gray-700";

  // Recursive function to render navigation items
  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const Icon = item.icon;
      // Use the item's specific isActive function if provided, otherwise default to false
      const isActive = item.isActive ? item.isActive(pathname, item.href, item.subItems) : false;
      // Section is open if explicitly toggled OR if it's currently active
      const isOpen = openSections[item.label] === undefined ? isActive : openSections[item.label];

      // Define base classes
      const baseClasses = "flex items-center py-2 pl-4 pr-6";

      if (item.subItems) {
        // --- Render parent item (button) - no direct href navigation ---
        return (
          <div key={item.label} className="px-3 py-1">
            <button
              onClick={() => toggleSection(item.label)}
              className={`${baseClasses} w-full text-left text-sm transition-all duration-150 ease-in-out rounded-lg ${
                isActive ? mainMenuActiveClasses : `text-gray-600 ${mainMenuHoverClasses}`
              }`}
            >
              <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-1 font-normal">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-0' : '-rotate-90'
                } ${isActive ? 'text-blue-100' : 'text-gray-400'}`}
              />
            </button>
            {/* Render sub-items with animation */}
            <div
              className={`mt-1 ml-4 pl-3 border-l border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[500px]' : 'max-h-0' // Use a generous max-height for transition
              }`}
              // style={{ maxHeight: isOpen ? `${item.subItems.length * 40}px` : '0' }} // CSS class preferred over inline style
            >
              {renderNavItems(item.subItems, true)}
            </div>
          </div>
        );
      } else if (item.href) { // Ensure href exists before rendering a Link
        // --- Render regular link item ---
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClasses} gap-3 rounded-lg text-sm transition-all duration-150 ease-in-out ${
              isSubmenu ? 'ml-3' : 'mx-3' // Indent submenus slightly less than the parent button padding allows
            } ${
              isActive
                ? (isSubmenu ? subMenuActiveClasses : mainMenuActiveClasses)
                : `text-gray-600 ${isSubmenu ? subMenuHoverClasses : mainMenuHoverClasses}`
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? (isSubmenu ? 'text-gray-600' : 'text-white') : 'text-gray-400'}`} />
            <span className="font-normal">{item.label}</span>
          </Link>
        );
      }
      // Return null if it's somehow an item without subItems and without href
      return null;
    });
  };

  return (
    <aside className="hidden border-r bg-white md:block w-64 flex-shrink-0 google-font">
      <div className="flex h-full max-h-screen flex-col">
        {/* === Sidebar Header === */}
        <div className="flex h-[60px] items-center border-b px-4">
           <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="relative h-8 w-8 mr-2">
                  <Image
                    src="/logo/ov_logo.png" // Make sure this path is correct
                    alt="OpenVisa Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="text-xl font-normal bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 drop-shadow-sm">
                  AMS
                </h1>
              </Link>
            </div>
        </div>
        {/* === End of Sidebar Header === */}

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 sidebar-scroll">
          <nav className="flex flex-col gap-1 text-sm font-normal">
            {renderNavItems(navItems)}
          </nav>
        </div>

      </div>
      {/* Scrollbar styling and Google font styling */}
      <style jsx global>{`
        /* Import Google Fonts - Product Sans or similar */
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap');

        /* Fallback to common Google-like fonts if Google Sans isn't available */
        .google-font {
          font-family: 'Google Sans', 'Product Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          font-weight: 400;
          letter-spacing: 0.2px;
        }

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
        /* For Firefox */
        .sidebar-scroll {
          scrollbar-width: thin; scrollbar-color: #e5e7eb transparent;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;