// src/components/layout/Sidebar.tsx
'use client'; // Needed if you add interactive elements or use hooks like usePathname

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Example if you want active highlighting
import { Home, Wrench, List, PlusCircle } from 'lucide-react'; // Example Icons

const Sidebar: React.FC = () => {
  const pathname = usePathname(); // Example hook

  const navItems = [
    // { href: '/dashboard', label: 'Dashboard', icon: Home }, // Example
    { href: '/visa-types', label: 'Visa Types List', icon: List }, // Link to view existing types
    { href: '/visa-builder', label: 'Visa Builder', icon: Wrench }, // Current page
    // Add more links as your application grows
  ];

  return (
    <aside className="hidden border-r bg-white md:block w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Sidebar Header (Optional) */}
        <div className="flex h-[60px] items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
             {/* <Package2 className="h-6 w-6" /> */}
             <span className="">Navigation</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Optional) */}
        {/* <div className="mt-auto p-4"> ... </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;