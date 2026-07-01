// src/app/layout.tsx
import type { Metadata } from 'next';
import { Fraunces, Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import QueryProvider from '@/providers/QueryProvider'; // Adjust path if needed? Should be correct based on tree.

const inter = Inter({ subsets: ['latin'] });

// OpenVisa Design System typefaces — scoped to the marketing surfaces via CSS
// variables so the rest of the app keeps its existing Inter default.
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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
    <html
      lang="en"
      className={`${interTight.variable} ${fraunces.variable} ${jetBrainsMono.variable}`}
    >
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