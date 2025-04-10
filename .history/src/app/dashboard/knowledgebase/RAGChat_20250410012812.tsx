// app/components/knowledgebase/RAGChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ukVisaTypes, VisaType } from '@/lib/mockvisas';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: {
    text: string;
    link: string;
  }[];
}

export function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVisaSelect = (visa: VisaType) => {
    setSelectedVisa(visa);
    // Optional: Add a system message indicating the visa context has changed
    if (messages.length > 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Now discussing ${visa.name}. How can I help you with this visa type?`
      }]);
    }
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
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg bg-white dark:bg-gray-900">
      {/* Left Column - Visa List */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-medium">UK Visa Types</h3>
          <p className="text-xs text-gray-500">Select a visa to discuss</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {ukVisaTypes.map((visa) => (
              <button
                key={visa.id}
                onClick={() => handleVisaSelect(visa)}
                className={`w-full text-left p-2 rounded-md mb-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedVisa?.id === visa.id 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-medium' 
                    : ''
                }`}
              >
                <span className="truncate">{visa.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Column - Chat Interface */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {selectedVisa 
              ? `${selectedVisa.name} - Knowledge Assistant` 
              : 'Visa Knowledge Assistant'}
          </h2>
          <p className="text-sm text-gray-500">
            {selectedVisa 
              ? `Ask questions about ${selectedVisa.name} procedures and requirements` 
              : 'Select a visa type or ask general visa questions'}
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Visa Knowledge Assistant</p>
                <p className="text-sm mt-1">
                  {selectedVisa 
                    ? `Ask me anything about ${selectedVisa.name}` 
                    : 'Select a visa type from the left panel or ask a general question'}
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div
                  className={`flex items-start gap-2.5 max-w-[80%] ${
                    message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    message.role === 'assistant' 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {message.content}
                    
                    {message.citations && (
                      <div className="mt-2 text-xs border-t pt-2">
                        <p className="font-semibold">Sources:</p>
                        {message.citations.map((citation, idx) => (
                          <a
                            key={idx}
                            href={citation.link}
                            className="block text-blue-500 hover:underline mt-1"
                          >
                            {citation.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'assistant' ? (
                    <Bot className="w-6 h-6 text-gray-500" />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedVisa 
                ? `Ask about ${selectedVisa.name}...` 
                : "Ask about visa procedures..."}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
