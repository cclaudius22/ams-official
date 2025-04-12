// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, Wrench, CheckCircle, CircleDot } from 'lucide-react'; // Updated Icons

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Updated Navigation Items
  const navItems = [
    // Assuming these routes will exist later
    { href: '/visa-builder/new-list', label: 'New Visa Types', icon: CircleDot }, // Route for viewing unreviewed/unpublished
    { href: '/visa-builder/published-list', label: 'Published Visa Types', icon: CheckCircle }, // Route for viewing published
    { href: '/visa-builder', label: 'Visa Builder Tool', icon: Wrench }, // The current builder page
    // Add other relevant links if needed
  ];

  return (
    <aside className="hidden border-r bg-white md:block w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link href="#" className="flex items-center gap-2 font-semibold">
             <span className="">Visa Configuration</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => {
              // Basic active check - adjust if routes become more complex (e.g., '/visa-builder/edit/[id]')
              const isActive = pathname === item.href || (item.href === '/visa-builder' && pathname.startsWith('/visa-builder'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-semibold' // Highlight active link
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-gray-800' : 'text-gray-400'}`} /> {/* Icon color change */}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;