'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { processChatbotMessage, isConfirmation } from '@/utils/chatbot';
import { sanitizeInput, validateMessageLength, detectPromptInjection } from '@/utils/security';
import { clsx } from 'clsx';

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
  onRemoveRoommate: (name: string) => void;
  onRemoveCustomExpense: (name: string) => void;
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
  onRemoveRoommate,
  onRemoveCustomExpense,
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastEnterPressRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Load saved preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('chatbot-closed');
    if (savedPreference === 'true') {
      setIsOpen(false);
    }
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability and screen size
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 640;
      setIsMobile(hasTouch && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

    // Client-side validation and sanitization
    const rawMessage = inputValue.trim();
    const sanitizedMessage = sanitizeInput(rawMessage);
    
    // Validate message length
    const lengthCheck = validateMessageLength(sanitizedMessage);
    if (!lengthCheck.valid) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: lengthCheck.error || 'Your message is too long. Please shorten it and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Check for prompt injection (client-side warning only, server will block)
    const injectionCheck = detectPromptInjection(sanitizedMessage);
    if (injectionCheck.isInjection && injectionCheck.confidence === 'high') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: 'I cannot process that type of message. Please rephrase your question or request.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setInputValue('');
      return;
    }

    const userMessageText = sanitizedMessage;
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
            onRemoveRoommate,
            onRemoveCustomExpense,
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

        // If autofill is available, execute it immediately unless the user is asking a question
        if (botResponse.autofill) {
          // Check if the user's message is clearly a question (should not auto-execute for questions)
          // Questions typically end with "?" or start with question words
          const isQuestion = userMessageText.trim().endsWith('?') || 
            /^(what|how|when|where|why|who|can you|could you|would you|should i|do you|does|is|are|will|did|tell me|explain|help me)/i.test(userMessageText.trim());
          
          // Default to auto-executing autofill unless it's clearly a question
          // This handles direct data statements like "rent is 3356", "my name is matthew", etc.
          if (!isQuestion) {
            // Execute autofill immediately after a short delay to show the bot message first
            setTimeout(() => {
              botResponse.autofill!();
              setPendingAutofill(null);
            }, 300);
          } else {
            // Store pending autofill only for questions
            setPendingAutofill(() => botResponse.autofill!);
          }
        } else {
          setPendingAutofill(null);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        let errorContent = 'Sorry, I encountered an error. Please try again or rephrase your message.';
        
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes('Rate limit')) {
            errorContent = 'Too many requests. Please wait a moment and try again.';
          } else if (error.message.includes('Invalid request')) {
            errorContent = 'Your message could not be processed. Please rephrase and try again.';
          }
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: errorContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        // Mobile: Double Enter to send
        const now = Date.now();
        if (lastEnterPressRef.current && now - lastEnterPressRef.current < 500) {
          // Second Enter within 500ms - send message
          e.preventDefault();
          lastEnterPressRef.current = null;
          handleSend();
        } else {
          // First Enter or Enter after timeout - allow newline
          lastEnterPressRef.current = now;
        }
      } else {
        // Desktop: Shift+Enter for newline, Enter alone sends
        if (!e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
        // If Shift+Enter, allow default behavior (newline)
      }
    } else {
      // Reset Enter tracking if any other key is pressed
      lastEnterPressRef.current = null;
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, string> = {
      'help-form': 'I\'d like help filling out the form',
      'explain-features': 'Can you explain how the app works?',
      'income-vs-room': 'What\'s the difference between income-based and room size-based splitting?',
      'update-all': 'Fill all fields with everything you know from our conversation. Update all form fields with the rent, utilities, roommates, expenses, currency, and split method we discussed.',
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-14 w-14 min-w-[56px] min-h-[56px] rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-bounce touch-manipulation select-none"
          aria-label="Open chatbot"
          style={{ 
            animationDuration: '2s', 
            animationIterationCount: 'infinite',
            touchAction: 'manipulation'
          }}
        >
          <MessageCircle className="h-6 w-6 mx-auto" />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop - Hidden on mobile to prevent scrolling issues */}
          <div
            className={`hidden sm:block fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
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
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 rounded transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation select-none"
              aria-label="Close chatbot"
              style={{ touchAction: 'manipulation' }}
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
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95 active:bg-gray-100 touch-manipulation min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                Help Fill Form
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('explain-features')}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95 active:bg-gray-100 touch-manipulation min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                Explain Features
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('income-vs-room')}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95 active:bg-gray-100 touch-manipulation min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                Income vs Room Size
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('update-all')}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95 active:bg-gray-100 touch-manipulation min-h-[44px] bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700 font-medium"
                style={{ touchAction: 'manipulation' }}
              >
                Update All Fields
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y overscroll-contain select-text" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y pinch-zoom',
            }}
          >
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
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-200 hover:scale-110">
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
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110">
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
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
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
            <div className="flex gap-2 items-end">
              <div className="flex-1 min-w-0">
                <div className="w-full">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    aria-label="Chat input"
                    rows={1}
                    className={clsx(
                      'flex w-full min-h-[40px] max-h-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto',
                      'leading-normal'
                    )}
                    style={{
                      height: 'auto',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || sendingMessage}
                className={`bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shrink-0 transition-all duration-200 min-w-[44px] min-h-[44px] touch-manipulation ${
                  sendingMessage 
                    ? 'animate-pulse scale-95' 
                    : 'hover:scale-110 active:scale-95'
                }`}
                aria-label="Send message"
                style={{ touchAction: 'manipulation' }}
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

