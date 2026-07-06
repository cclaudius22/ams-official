// app/components/knowledgebase/RAGChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Volume2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ukVisaTypes, VisaType } from '@/lib/mockvisas'; // Assuming mockvisas is correctly located
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Define the Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: {
    text: string;
    link: string; // Assuming link might be '#' if no specific URL
  }[];
}

// --- Sub-Components (Keep these as they were or refine as needed) ---

// Component for the visa selection sidebar
const VisaSidebar = ({
  visaTypes,
  selectedVisa,
  onSelect
}: {
  visaTypes: VisaType[];
  selectedVisa: VisaType | null;
  onSelect: (visa: VisaType) => void;
}) => (
  <div className="w-72 border-r flex flex-col bg-gray-50 dark:bg-gray-900 h-full"> {/* Ensure full height */}
    <div className="p-4 border-b">
      <h3 className="font-medium text-lg">UK Visa Types</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Select a visa to discuss</p>
    </div>
    <ScrollArea className="flex-1"> {/* Allow sidebar content to scroll */}
      <div className="p-3 space-y-1">
        {visaTypes.map((visa) => (
          <button
            key={visa.id}
            onClick={() => onSelect(visa)}
            className={`w-full text-left p-3 rounded-md text-sm transition-colors flex items-center
              ${selectedVisa?.id === visa.id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <span className="truncate">{visa.name}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  </div>
);

// Component for chat message bubbles
const ChatMessage = ({
  message,
  onSpeakText
}: {
  message: Message;
  onSpeakText: (text: string) => void;
}) => (
  <div className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
    <div className={`flex items-start gap-2 max-w-[85%] ${
      message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
    }`}>
      <div className={`flex-shrink-0 mt-1`}> {/* Consistent margin */}
        {message.role === 'assistant' ? (
          <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-200" />
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        )}
      </div>

      <div className={`p-3 rounded-lg shadow-sm ${
        message.role === 'assistant'
          ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
          : 'bg-blue-600 dark:bg-blue-700 text-white'
      }`}>
        <div className="flex flex-col">
          {/* Use prose for better markdown rendering if needed, otherwise keep simple */}
          <div className="whitespace-pre-wrap break-words">{message.content}</div>

          {message.role === 'assistant' && (
            <div className="flex justify-end mt-1 items-center">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => onSpeakText(message.content)}
                    >
                      <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="sr-only">Read aloud</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Read aloud</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {message.citations && message.citations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
              <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Sources:</p>
              <div className="space-y-1">
                {message.citations.map((citation, idx) => (
                  <a
                    key={idx}
                    href={citation.link}
                    className="block text-blue-500 hover:underline truncate" // Added truncate
                    target="_blank"
                    rel="noopener noreferrer"
                    title={citation.text} // Add title for full text on hover
                  >
                    [{idx + 1}] {citation.text}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);


// Component for chat input form
const ChatInputForm = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  placeholder
}: {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder: string;
}) => {
  // Handle Enter key press for submission, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      if (!isLoading && input.trim()) {
         // Trigger form submission logic
         // Need to access the form's submit handler.
         // A simple way is to get the form element and call requestSubmit()
         // or pass the onSubmit function down and call it directly.
         // Let's pass onSubmit directly for simplicity here.
         onSubmit(e as React.FormEvent); // Cast needed as it's not a true form event origin
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t bg-white dark:bg-gray-900">
      <div className="flex flex-col gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // Add keydown handler
          placeholder={placeholder}
          className="min-h-[80px] max-h-[160px] resize-none focus-visible:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          disabled={isLoading}
          rows={3} // Start with a reasonable height
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
             {/* Simple info text instead of button for now */}
             <span>Press Shift+Enter for newline.</span>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
   );
};


// Empty state component
const EmptyState = ({ selectedVisa }: { selectedVisa: VisaType | null }) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
      <Bot className="w-8 h-8 text-blue-500 dark:text-blue-300" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Visa Knowledge Assistant</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
      {selectedVisa
        ? `Ask questions about the ${selectedVisa.name}: requirements, eligibility, documents, etc.`
        : 'Select a visa type from the sidebar on the left, or ask a general UK visa question.'}
    </p>

    {selectedVisa && (
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {/* Example questions as badges */}
        <Badge variant="outline" className="px-3 py-1 cursor-default">What are the requirements?</Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-default">How long does it take?</Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-default">What documents are needed?</Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-default">Check eligibility</Badge>
      </div>
    )}
  </div>
);


// --- Main RAGChat component with the fix ---

export function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false); // State to track speech synthesis
  const chatEndRef = useRef<HTMLDivElement>(null); // Ref for the element to scroll to

  // Function to scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // *** THE FIX IS HERE ***
  // useEffect to scroll down when messages change or loading state changes
  useEffect(() => {
    // Only scroll if there are messages or loading might affect layout
    if (messages.length > 0 || isLoading) {
        // ---> Delay scrolling slightly to allow DOM to update <---
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 50); // 50ms delay, adjust if needed (0 might work sometimes)

        // Cleanup function to clear the timeout if component unmounts
        // or dependencies change before timeout triggers
        return () => clearTimeout(timer);
    }
  }, [messages, isLoading]); // Dependencies: run when messages or isLoading change


  // Stop speech synthesis when component unmounts or selected visa changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, [selectedVisa]); // Also cancel speech if visa changes

  // Handler for selecting a visa type
  const handleVisaSelect = (visa: VisaType) => {
    setSelectedVisa(visa);
    // Clear chat and add a welcome message for the new visa
    setMessages([{
      role: 'assistant',
      content: `Okay, let's discuss the ${visa.name}. What would you like to know?`
    }]);
    // Cancel any ongoing speech
     if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
  };

  // Handler for submitting the chat form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; // Prevent submission if loading or empty

    const userMessageContent = input;
    setInput(''); // Clear input immediately

    // Add user message optimistically
    setMessages(prev => [...prev, { role: 'user', content: userMessageContent }]);
    setIsLoading(true);

    // Stop any current speech before sending new request
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/knowledgebase/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageContent,
          visaType: selectedVisa?.id // Send the selected visa ID to the backend
        })
      });

      setIsLoading(false); // Set loading false *after* fetch, before processing response

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
         console.error('API Error Response:', errorData);
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || "Sorry, I didn't get a valid response.",
        citations: data.citations // Expecting citations from the backend
      }]);

    } catch (error) {
      console.error('Chat submission error:', error);
      setIsLoading(false); // Ensure loading is off on error
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error && error.message ? error.message : 'Please try again.'}`
      }]);
    }
    // Note: scrollToBottom will be triggered by the useEffect watching `messages` and `isLoading`
  };

  // Function to speak the text using the Web Speech API
  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser.');
      // Optionally show a message to the user
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }

    // If already speaking this text, cancel it (effectively toggles off)
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return; // Stop here if we just cancelled
    }

    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB'; // British English voice
    utterance.rate = 1.0;    // Normal speed
    utterance.pitch = 1.0;   // Normal pitch

    // Event listeners for state changes
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // Determine placeholder text for the input
  const getInputPlaceholder = () => {
    if (!selectedVisa) return "Select a visa or ask a general question...";
    return `Ask about ${selectedVisa.name}... (e.g., eligibility, documents)`;
  };

  return (
    <Card className="flex h-[700px] w-full max-w-5xl mx-auto bg-white dark:bg-gray-950 overflow-hidden shadow-xl border dark:border-gray-800 rounded-lg">
      {/* Visa Sidebar */}
      <VisaSidebar
        visaTypes={ukVisaTypes}
        selectedVisa={selectedVisa}
        onSelect={handleVisaSelect}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* flex-1 makes this take remaining space */}
        {/* Chat Header */}
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {selectedVisa
                ? selectedVisa.name
                : 'UK Visa Assistant'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedVisa
                ? `Discussing ${selectedVisa.category}` // Example: show category
                : 'Select a visa or ask a general question'}
            </p>
          </div>
          {selectedVisa && (
            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              {selectedVisa.id} {/* Show visa ID or type */}
            </Badge>
          )}
        </div>

        {/* Message List Area */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
          {/* Container for messages to center them */}
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 && !isLoading ? (
              // Show EmptyState only when truly empty and not loading first message
              <EmptyState selectedVisa={selectedVisa} />
            ) : (
              <div className="space-y-1">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index} // Using index is okay for chat if messages aren't reordered/deleted
                    message={message}
                    onSpeakText={speakText}
                  />
                ))}
                {/* Loading Indicator (shown within message flow) */}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start gap-2 max-w-[85%] flex-row">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2">
                          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-200" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                 {/* Invisible div at the end to scroll to */}
                <div ref={chatEndRef} style={{ height: '1px' }} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input Form */}
        <ChatInputForm
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={getInputPlaceholder()}
        />
      </div>
    </Card>
  );
}