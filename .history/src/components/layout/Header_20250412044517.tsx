import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  userName?: string;
  appName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  breadcrumbs: propBreadcrumbs,
  userName = 'User',
  appName = 'Admin'
}) => {
  const router = useRouter();
  
  // Generate breadcrumbs dynamically if not provided via props
  const generateDynamicBreadcrumbs = (): BreadcrumbItem[] => {
    if (propBreadcrumbs && propBreadcrumbs.length) {
      return propBreadcrumbs;
    }
    
    // Skip empty paths and filter out query parameters
    const pathSegments = router.asPath.split('?')[0].split('/').filter(segment => segment);
    
    const dynamicBreadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';
    
    // Add Home as first item
    dynamicBreadcrumbs.push({ label: 'Home', href: '/' });
    
    // Build breadcrumb for each path segment
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      // Format the label by capitalizing and replacing dashes/underscores with spaces
      const label = segment
        .replace(/-|_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      // Last segment doesn't get a link
      if (index === pathSegments.length - 1) {
        dynamicBreadcrumbs.push({ label });
      } else {
        dynamicBreadcrumbs.push({ label, href: currentPath });
      }
    });
    
    return dynamicBreadcrumbs;
  };
  
  const breadcrumbs = generateDynamicBreadcrumbs();

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

export default Header;