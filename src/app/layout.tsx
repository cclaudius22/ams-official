// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import QueryProvider from '@/providers/QueryProvider'; // Adjust path if needed? Should be correct based on tree.

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Visa Review System',
  description: 'Application review dashboard',
};

// RootLayout remains a Server Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // --- ENSURE THESE TAGS EXIST ---
    <html lang="en">
      <body className={inter.className}>
        {/* Use the imported Provider Component to wrap children */}
        <QueryProvider>
           {children}
        </QueryProvider>
      </body>
    </html>
    // --- END ENSURE ---
  );
}