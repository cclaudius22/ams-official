import React from 'react';
import Link from 'next/link';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  userName?: string;
  appName?: string;
  currentPath?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  breadcrumbs: propBreadcrumbs,
  userName = 'User',
  appName = 'Admin',
  currentPath = ''
}) => {
  
  // Use provided breadcrumbs or generate a default one
  const breadcrumbs = propBreadcrumbs?.length ? propBreadcrumbs : [
    { label: 'Home', href: '/' }
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo and breadcrumbs section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-2">
              <span className="text-white font-bold">{appName.charAt(0)}</span>
            </div>
            <span className="font-medium text-gray-800">{appName}</span>
          </Link>
          
          {/* Breadcrumbs - now wrapped in a container with proper width */}
          <div className="overflow-hidden">
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center text-sm text-gray-500 overflow-x-auto">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="mx-2 flex-shrink-0">›</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-blue-500 whitespace-nowrap">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-700 whitespace-nowrap">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
        </div>
        
        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search for users, groups or settings"
            />
          </div>
        </div>
        
        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* User profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Create a wrapper component that handles breadcrumb generation
// You can use this in pages where you need dynamic breadcrumbs
export const HeaderWithBreadcrumbs: React.FC<Omit<HeaderProps, 'breadcrumbs'>> = (props) => {
  // This hook must be used in a component wrapped by Next.js Router
  // const router = useRouter();
  
  // For now, just pass through to the base component
  // If you need dynamic breadcrumbs later, you'll need to implement
  // a different approach, possibly using context or higher-order components
  return <Header {...props} />;
};

export default Header;