// src/components/layout/Header.tsx
import React from 'react';
import Link from 'next/link';
// You can add icons or other elements here later
// import { Package2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-white px-6 sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        {/* <Package2 className="h-6 w-6" /> Replace with your logo/icon */}
        <span className="">AMS Visa Config</span> {/* Or your App Name */}
      </Link>
      {/* Add other header elements here later (e.g., User Menu, Search) */}
      {/* <div className="ml-auto flex items-center gap-4">
         User dropdown, etc.
      </div> */}
    </header>
  );
};

export default Header;