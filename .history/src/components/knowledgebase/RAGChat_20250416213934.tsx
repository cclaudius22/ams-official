// app/components/knowledgebase/RAGChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Volume2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ukVisaTypes, VisaType } from '@/lib/mockvisas';
import { Tooltip } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Break down into smaller components for better maintainability
interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: {
    text: string;
    link: string;
  }[];
}

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
  <div className="w-72 border-r flex flex-col bg-gray-50 dark:bg-gray-900">
    <div className="p-4 border-b">
      <h3 className="font-medium text-lg">UK Visa Types</h3>
      <p className="text-sm text-gray-500">Select a visa to discuss</p>
    </div>
    <ScrollArea className="flex-1">
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
      <div className={`flex-shrink-0 ${message.role === 'assistant' ? 'mt-1' : 'mt-1'}`}>
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
          <div className="flex-1 whitespace-pre-wrap break-words">{message.content}</div>
          
          {message.role === 'assistant' && (
            <div className="flex justify-end mt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSpeakText(message.content)}
              >
                <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="sr-only">Read aloud</span>
              </Button>
            </div>
          )}
          
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
              <p className="font-semibold text-gray-600 dark:text-gray-300">Sources:</p>
              <div className="mt-1 space-y-1">
                {message.citations.map((citation, idx) => (
                  <a
                    key={idx}
                    href={citation.link}
                    className="block text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {citation.text}
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
}) => (
  <form onSubmit={onSubmit} className="p-4 border-t bg-white dark:bg-gray-900">
    <div className="flex flex-col gap-3">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] max-h-[160px] resize-none focus-visible:ring-blue-500"
        disabled={isLoading}
      />
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Info className="h-4 w-4 mr-1" />
            <span>How to use</span>
          </Button>
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          className="px-4 py-2"
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

// Empty state component
const EmptyState = ({ selectedVisa }: { selectedVisa: VisaType | null }) => (
  <div className="text-center py-12 px-4">
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
      <Bot className="w-8 h-8 text-blue-500 dark:text-blue-300" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Visa Knowledge Assistant</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
      {selectedVisa 
        ? `Get detailed information about ${selectedVisa.name} requirements, eligibility, and application process`
        : 'Select a visa type from the sidebar to get started'}
    </p>
    
    {selectedVisa && (
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        <Badge variant="outline" className="px-3 py-1">Requirements</Badge>
        <Badge variant="outline" className="px-3 py-1">Processing Time</Badge>
        <Badge variant="outline" className="px-3 py-1">Documentation</Badge>
        <Badge variant="outline" className="px-3 py-1">Fees</Badge>
        <Badge variant="outline" className="px-3 py-1">Eligibility</Badge>
      </div>
    )}
  </div>
);

// Main RAGChat component
export function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Try scrollIntoView for smooth scroll
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Fallback: force scroll to bottom on the scrollable container
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Stop speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleVisaSelect = (visa: VisaType) => {
    setSelectedVisa(visa);
    // Clear the chat window and start with a welcome message for the selected visa
    setMessages([{
      role: 'assistant',
      content: `Welcome to the ${visa.name} information center. How can I help you with this visa type today?`
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/knowledgebase/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          visaType: selectedVisa?.id // Include the selected visa ID in the request
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        citations: data.citations
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to speak the text using the Web Speech API
  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }
    
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const getInputPlaceholder = () => {
    if (!selectedVisa) return "Select a visa type or ask a general question...";
    return `Ask about ${selectedVisa.name} requirements, eligibility, documents...`;
  };

  return (
    <Card className="flex h-[700px] bg-white dark:bg-gray-900 overflow-hidden shadow-lg border rounded-lg">
      <VisaSidebar 
        visaTypes={ukVisaTypes}
        selectedVisa={selectedVisa}
        onSelect={handleVisaSelect}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-semibold">
              {selectedVisa 
                ? selectedVisa.name 
                : 'Visa Knowledge Assistant'}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedVisa 
                ? `Information about eligibility, requirements, and application process` 
                : 'Select a visa type to get started'}
            </p>
          </div>
          {selectedVisa && (
            <Badge variant="outline" className="px-3 py-1 text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              UK Visa
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 px-4 py-2 overflow-y-auto">
          <div
            className="max-w-3xl mx-auto h-full"
            ref={chatContainerRef}
            style={{ overflowY: 'auto', maxHeight: '100%' }}
          >
            {messages.length === 0 ? (
              <EmptyState selectedVisa={selectedVisa} />
            ) : (
              <div className="py-4 space-y-1">
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={index} 
                    message={message} 
                    onSpeakText={speakText} 
                  />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500 p-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing your request...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

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
