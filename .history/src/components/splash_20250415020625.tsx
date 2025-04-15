import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

// Array of messages with their associated background colors
const messages = [
  {
    id: 1,
    title: "AI-Driven Next-Gen Visa Management",
    description: "Leverage artificial intelligence for faster, more accurate visa processing and risk assessment.",
    bgColor: "from-[#2563eb] to-[#1e40af]" // Blue gradient
  },
  {
    id: 2,
    title: "Streamline citizen onboarding with our dynamic rendering engine",
    description: "Simplify application processes with adaptable forms and workflows.",
    bgColor: "from-[#4f46e5] to-[#3730a3]" // Indigo gradient
  },
  {
    id: 3,
    title: "Enhanced Audit Control for Government Compliance",
    description: "Maintain comprehensive logs and ensure adherence to regulations.",
    bgColor: "from-[#7c3aed] to-[#5b21b6]" // Purple gradient
  },
  {
    id: 4,
    title: "Build custom visa types in minutes",
    description: "Utilize our intuitive builder to create and deploy new visa categories quickly.",
    bgColor: "from-[#6366f1] to-[#4338ca]" // Different blue gradient
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
