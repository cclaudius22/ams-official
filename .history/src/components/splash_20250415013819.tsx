import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // You might need to install framer-motion: npm install framer-motion

// Array of messages to display
const messages = [
  {
    id: 1,
    title: "AI-Driven Next-Gen Visa Management",
    description: "Leverage artificial intelligence for faster, more accurate visa processing and risk assessment.",
    icon: ( // Example icon (replace with actual SVG or component if needed)
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0 1.414-.295 2.759-.81 3.988m-13.38 0c-.515-1.229-.81-2.574-.81-3.988m15 0c0-4.142-3.358-7.5-7.5-7.5S4.5 7.858 4.5 12" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Streamline citizen onboarding with our dynamic rendering engine",
    description: "Simplify application processes with adaptable forms and workflows.",
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
     icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.145l-5.457 5.457a3.003 3.003 0 00-3.478 3.478l-1.554 6.361 6.361-1.554a3.003 3.003 0 003.478-3.478z" />
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
    <div className="w-full relative bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center items-center p-10 text-white overflow-hidden h-full">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/ams-pattern.svg')] opacity-10"></div>

      {/* Animated content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
         {/* Static Logo/Icon Area */}
         <div className="mb-8 bg-white/10 p-5 rounded-full shadow-lg">
             <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center">
                 {/* You can place a static logo here if desired */}
                 <span className="text-3xl font-bold text-white opacity-80">AMS</span>
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
