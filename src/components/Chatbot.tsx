'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { processChatbotMessage, isConfirmation } from '@/utils/chatbot';

// Simple markdown renderer for bot messages
function MessageContent({ content }: { content: string }) {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (line.trim() === '') {
      parts.push(<br key={`br-${lineIndex}`} />);
      return;
    }
    
    // Process bold text **text**
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    const lineParts: React.ReactNode[] = [];
    let match;
    
    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        lineParts.push(line.substring(lastIndex, match.index));
      }
      // Add bold text
      lineParts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < line.length) {
      lineParts.push(line.substring(lastIndex));
    }
    
    // If no bold matches, just add the line as-is
    if (lineParts.length === 0) {
      lineParts.push(line);
    }
    
    parts.push(
      <p key={`line-${lineIndex}`} className="text-sm">
        {lineParts}
      </p>
    );
  });
  
  return <div className="whitespace-pre-wrap">{parts}</div>;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  onSetTotalRent: (rent: number) => void;
  onSetUtilities: (utilities: number) => void;
  onAddRoommate: (name: string, income: number, roomSize?: number) => void;
  onAddCustomExpense: (name: string, amount: number) => void;
  onSetCurrency: (currency: string) => void;
  onSetSplitMethod: (useRoomSizeSplit: boolean) => void;
  currentState?: {
    totalRent?: number;
    utilities?: number;
    roommates?: Array<{ name: string; income?: number; roomSize?: number }>;
    customExpenses?: Array<{ name: string; amount: number }>;
    currency?: string;
    useRoomSizeSplit?: boolean;
  };
}

export function Chatbot({
  onSetTotalRent,
  onSetUtilities,
  onAddRoommate,
  onAddCustomExpense,
  onSetCurrency,
  onSetSplitMethod,
  currentState,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hi! I'm here to help you split rent fairly. I can help you fill out the form or answer questions about how the app works. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAutofill, setPendingAutofill] = useState<(() => void) | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('chatbot-closed');
    if (savedPreference === 'true') {
      setIsOpen(false);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    setSendingMessage(true);
    setInputValue('');
    
    // Small delay for send animation, then add user message
    setTimeout(async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setSendingMessage(false);

      // Check if this is a confirmation for pending autofill
      if (pendingAutofill && isConfirmation(userMessageText)) {
        setTimeout(() => {
          pendingAutofill();
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: 'Great! I\'ve filled in the form for you. You can review and adjust any values if needed.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          setPendingAutofill(null);
        }, 500);
        return;
      }

      // Process message with LLM API
      try {
        // Build conversation history (excluding the current message)
        const currentMessages = [...messages, userMessage];
        const conversationHistory = currentMessages
          .slice(1) // Skip the initial greeting
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

        const botResponse = await processChatbotMessage(
          userMessageText,
          conversationHistory,
          {
            onSetTotalRent,
            onSetUtilities,
            onAddRoommate,
            onAddCustomExpense,
            onSetCurrency,
            onSetSplitMethod,
          },
          currentState
        );

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: botResponse.content,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        // Store pending autofill if available
        if (botResponse.autofill) {
          setPendingAutofill(() => botResponse.autofill!);
        } else {
          setPendingAutofill(null);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again or rephrase your message.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }, 150);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, string> = {
      'help-form': 'I\'d like help filling out the form',
      'explain-features': 'Can you explain how the app works?',
      'income-vs-room': 'What\'s the difference between income-based and room size-based splitting?',
    };

    setInputValue(quickMessages[action] || '');
    setTimeout(() => handleSend(), 100);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      localStorage.setItem('chatbot-closed', 'false');
    }, 200); // Match animation duration
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
    localStorage.setItem('chatbot-closed', 'false');
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-bounce"
          aria-label="Open chatbot"
          style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
        >
          <MessageCircle className="h-6 w-6 mx-auto" />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div
            className={`fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-50 w-auto sm:w-full sm:max-w-md h-[600px] max-h-[85vh] flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200/50 transition-all duration-300 transform ${
              isClosing
                ? 'translate-y-4 opacity-0 scale-95'
                : 'translate-y-0 opacity-100 scale-100'
            }`}
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
          >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h2 id="chatbot-title" className="font-semibold">Rent Splitter Assistant</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-blue-700 rounded transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('help-form')}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Help Fill Form
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('explain-features')}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Explain Features
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('income-vs-room')}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Income vs Room Size
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 transition-all duration-300 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ 
                  animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {message.role === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <MessageContent content={message.content} />
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div 
                className="flex gap-3 justify-start transition-all duration-300"
                style={{ animation: 'fadeInUp 0.3s ease-out both' }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 items-center">
              <div className="flex-1 min-w-0">
                <div className="w-full">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    aria-label="Chat input"
                    label=""
                  />
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || sendingMessage}
                className={`bg-blue-600 hover:bg-blue-700 flex-shrink-0 transition-all duration-200 ${
                  sendingMessage 
                    ? 'animate-pulse scale-95' 
                    : 'hover:scale-110 active:scale-95'
                }`}
                aria-label="Send message"
              >
                <Send className={`h-4 w-4 transition-transform duration-200 ${
                  sendingMessage ? 'rotate-12' : ''
                }`} />
              </Button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}

