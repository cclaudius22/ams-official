import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

// Array of messages with their associated background colors
const messages = [
  {
    id: 1,
    title: "AI-Driven Next-Gen Visa Management",
    description: "Leverage artificial intelligence for faster, more accurate visa processing and risk assessment.",
    bgColor: "from-[#2563eb] to-[#1e40af]", // Blue gradient
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Streamline citizen onboarding with our dynamic rendering engine",
    description: "Simplify application processes with adaptable forms and workflows.",
    bgColor: "from-[#4f46e5] to-[#3730a3]", // Indigo gradient
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Enhanced Audit Control for Government Compliance",
    description: "Maintain comprehensive logs and ensure adherence to regulations.",
    bgColor: "from-[#7c3aed] to-[#5b21b6]", // Purple gradient
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
  },
  {
    id: 4,
    title: "Build custom visa types in minutes",
    description: "Utilize our intuitive builder to create and deploy new visa categories quickly.",
    bgColor: "from-[#6366f1] to-[#4338ca]", // Different blue gradient
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    )
  },
];

// Interval time in milliseconds
const INTERVAL_TIME = 5000; // 5 seconds

export default function Splash() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Set up the interval to change the message
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, INTERVAL_TIME);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const currentMessage = messages[currentIndex];

  return (
    <div className={`w-full relative bg-gradient-to-br ${currentMessage.bgColor} flex flex-col justify-center items-center p-10 text-white overflow-hidden h-full transition-colors duration-500`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/ams-pattern.svg')] opacity-10"></div>

      {/* Animated content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
         {/* Logo Area */}
         <div className="mb-8">
             <div className="relative h-24 w-24 overflow-hidden">
                 <Image
                     src="/logo/ov_logo.png"
                     alt="Open Visa Logo"
                     fill
                     style={{ objectFit: 'contain' }}
                     priority
                     className="drop-shadow-lg"
                 />
             </div>
         </div>

        {/* AnimatePresence handles the enter/exit animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage.id} // Key change triggers animation
            initial={{ opacity: 0, y: 20 }} // Start invisible and slightly down
            animate={{ opacity: 1, y: 0 }} // Fade in and move up
            exit={{ opacity: 0, y: -20 }} // Fade out and move up
            transition={{ duration: 0.5 }} // Animation duration
            className="flex flex-col items-center" // Center content
          >
            {/* Optional Icon */}
            {currentMessage.icon}

            {/* Message Title */}
            <h2 className="text-3xl font-bold mb-3 leading-tight">
              {currentMessage.title}
            </h2>

            {/* Message Description */}
            <p className="text-lg text-blue-100 opacity-90">
              {currentMessage.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
