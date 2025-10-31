interface ParsedData {
  totalRent?: number;
  utilities?: number;
  roommates?: Array<{ name: string; income?: number; roomSize?: number }>;
  customExpenses?: Array<{ name: string; amount: number }>;
  currency?: string;
  useRoomSizeSplit?: boolean;
}

interface BotResponse {
  content: string;
  autofill?: () => void;
  parsedData?: ParsedData;
}

/**
 * Extract rent amount from text
 */
function extractRent(text: string): number | null {
  // Patterns: "$2000", "2000", "rent is $2000", "monthly rent 2000"
  const patterns = [
    /rent\s*(?:is|:)?\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s*month|monthly|rent)/i,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s*month|monthly|rent)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 100000) return amount;
    }
  }

  return null;
}

/**
 * Extract utilities amount from text
 */
function extractUtilities(text: string): number | null {
  // Patterns: "utilities $300", "utilities are 300", "$300 utilities"
  const patterns = [
    /utilit(?:y|ies)\s*(?:is|are|:)?\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:for\s*)?utilit(?:y|ies)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 10000) return amount;
    }
  }

  return null;
}

/**
 * Extract roommate information from text
 */
function extractRoommates(text: string): Array<{ name: string; income?: number; roomSize?: number }> {
  const roommates: Array<{ name: string; income?: number; roomSize?: number }> = [];

  // Pattern: "Alice makes $60k", "Bob earns 80000", "Charlie 70k", "Dave makes $5k per month"
  const incomePatterns = [
    // Annual: "$60k", "$60 thousand", "$60,000 per year", "60k annually"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:makes|earns|income|salary|is|has|:|makes?)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:k|thousand)?\s*(?:per\s*(?:year|annually|yr))?/gi,
    // Monthly: "$5000 per month", "$5k/month", "5000 monthly"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:makes|earns|income|salary|is|has|:|makes?)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:k|thousand)?\s*(?:per\s*month|monthly|\/month)/gi,
    // Weekly: "$1000 per week", "$1k/week"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:makes|earns|income|salary|is|has|:|makes?)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:k|thousand)?\s*(?:per\s*week|weekly|\/week)/gi,
  ];
  
  for (const pattern of incomePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      let income = parseFloat(match[2].replace(/,/g, ''));
      
      // Check if it's k/thousand notation
      const matchText = match[0].toLowerCase();
      if (matchText.includes('k') || matchText.includes('thousand')) {
        income *= 1000;
      }
      
      // Convert to annual if monthly or weekly
      if (matchText.includes('month') || matchText.includes('/month')) {
        income *= 12; // Convert monthly to annual
      } else if (matchText.includes('week') || matchText.includes('/week')) {
        income *= 52; // Convert weekly to annual
      }
      
      // Validate income range (annual: 20k to 500k typically)
      if (income >= 20000 && income <= 500000) {
        const existing = roommates.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          existing.income = income;
        } else {
          roommates.push({ name, income });
        }
      }
    }
  }

  // Pattern: "Alice room is 150 sq ft", "Bob's room 200 square feet"
  const roomSizePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?:'s)?\s+room\s+(?:is|:)?\s*(\d+)\s*(?:sq\s*ft|square\s*feet|sqft)/gi;
  let match;
  while ((match = roomSizePattern.exec(text)) !== null) {
    const name = match[1].trim();
    const roomSize = parseInt(match[2]);
    if (roomSize > 0 && roomSize < 5000) {
      const existing = roommates.find(r => r.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.roomSize = roomSize;
      } else {
        roommates.push({ name, roomSize });
      }
    }
  }

  return roommates;
}

/**
 * Extract custom expenses from text
 */
function extractCustomExpenses(text: string): Array<{ name: string; amount: number }> {
  const expenses: Array<{ name: string; amount: number }> = [];

  // Pattern: "Internet is $75", "Cable $50", "Parking 100"
  const patterns = [
    /(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:is|:)?\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
  ];

  const expenseKeywords = ['internet', 'cable', 'parking', 'cleaning', 'wifi', 'netflix', 'spotify', 'gym'];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let name, amount;
      if (pattern.source.includes('for')) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        name = match[2].trim();
      } else {
        name = match[1].trim();
        amount = parseFloat(match[2].replace(/,/g, ''));
      }

      if (amount > 0 && amount < 10000) {
        // Check if it's likely an expense
        const nameLower = name.toLowerCase();
        if (expenseKeywords.some(keyword => nameLower.includes(keyword)) || 
            nameLower.includes('expense') || 
            nameLower.includes('bill')) {
          expenses.push({ name, amount });
        }
      }
    }
  }

  return expenses;
}

/**
 * Detect intent from user message
 */
function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Help intents
  if (lowerMessage.match(/(?:help|how|what|explain|tell me|show me)/i)) {
    if (lowerMessage.match(/(?:form|fill|enter|input)/i)) {
      return 'help-form';
    }
    if (lowerMessage.match(/(?:work|feature|do|use|app)/i)) {
      return 'explain-features';
    }
    if (lowerMessage.match(/(?:income|room|size|difference|split)/i)) {
      return 'income-vs-room';
    }
    return 'general-help';
  }

  // Autofill intent
  if (lowerMessage.match(/(?:fill|autofill|auto|enter|add|set|put)/i)) {
    return 'autofill';
  }

  // Check if message contains data
  if (extractRent(message) || extractUtilities(message) || extractRoommates(message).length > 0) {
    return 'autofill';
  }

  return 'general';
}

/**
 * Process user message using LLM API
 */
export async function processChatbotMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'bot'; content: string }>,
  callbacks: {
    onSetTotalRent: (rent: number) => void;
    onSetUtilities: (utilities: number) => void;
    onAddRoommate: (name: string, income: number, roomSize?: number) => void;
    onAddCustomExpense: (name: string, amount: number) => void;
    onSetCurrency: (currency: string) => void;
    onSetSplitMethod: (useRoomSizeSplit: boolean) => void;
  },
  currentState?: {
    totalRent?: number;
    utilities?: number;
    roommates?: Array<{ name: string; income?: number; roomSize?: number }>;
    customExpenses?: Array<{ name: string; amount: number }>;
    currency?: string;
    useRoomSizeSplit?: boolean;
  }
): Promise<BotResponse> {
  try {
    // Format conversation history for API
    const apiHistory = conversationHistory.map(msg => ({
      role: msg.role === 'bot' ? 'assistant' : 'user' as const,
      content: msg.content,
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: apiHistory,
        currentState: currentState || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const parsedData = data.parsedData as ParsedData | undefined;

    // Create autofill function if data was extracted
    let autofill: (() => void) | undefined;
    if (parsedData && Object.keys(parsedData).length > 0) {
      const foundItems: string[] = [];
      
      if (parsedData.totalRent) {
        foundItems.push(`Monthly rent: $${parsedData.totalRent.toLocaleString()}`);
      }
      if (parsedData.utilities) {
        foundItems.push(`Utilities: $${parsedData.utilities.toLocaleString()}`);
      }
      if (parsedData.roommates && parsedData.roommates.length > 0) {
        parsedData.roommates.forEach(rm => {
          if (rm.income) {
            foundItems.push(`Roommate: ${rm.name} (income: $${rm.income.toLocaleString()})`);
          }
          if (rm.roomSize) {
            foundItems.push(`Roommate: ${rm.name} (room size: ${rm.roomSize} sq ft)`);
          }
        });
      }
      if (parsedData.customExpenses && parsedData.customExpenses.length > 0) {
        parsedData.customExpenses.forEach(exp => {
          foundItems.push(`Expense: ${exp.name} ($${exp.amount.toLocaleString()})`);
        });
      }

      // Only show confirmation if we found data
      if (foundItems.length > 0) {
        autofill = () => {
          // Fill in order: rent first, then utilities, then roommates
          if (parsedData.totalRent) callbacks.onSetTotalRent(parsedData.totalRent);
          if (parsedData.utilities) callbacks.onSetUtilities(parsedData.utilities);
          
          // Validate and add roommates - ensure names are present
          if (parsedData.roommates) {
            parsedData.roommates.forEach(rm => {
              // CRITICAL: Ensure name is present before adding/updating
              if (rm.name && rm.name.trim()) {
                callbacks.onAddRoommate(rm.name, rm.income || 0, rm.roomSize);
              } else {
                console.warn('Skipping roommate: name is missing or empty');
              }
            });
          }
          
          // Validate and add expenses - ensure names are present
          if (parsedData.customExpenses) {
            parsedData.customExpenses.forEach(exp => {
              // CRITICAL: Ensure name and valid amount are present
              if (exp.name && exp.name.trim() && exp.amount > 0) {
                callbacks.onAddCustomExpense(exp.name, exp.amount);
              } else {
                console.warn(`Skipping expense: name or amount is invalid (name: ${exp.name}, amount: ${exp.amount})`);
              }
            });
          }
          
          if (parsedData.currency) callbacks.onSetCurrency(parsedData.currency);
          if (parsedData.useRoomSizeSplit !== undefined) {
            callbacks.onSetSplitMethod(parsedData.useRoomSizeSplit);
          }
        };
      }
    }

    return {
      content: data.content || 'I\'m here to help!',
      autofill,
      parsedData,
    };
  } catch (error) {
    console.error('LLM API error, falling back to rules:', error);
    // Fallback to rules-based approach
    return processChatbotMessageRules(message, callbacks);
  }
}

/**
 * Process user message using rules-based approach (fallback)
 */
function processChatbotMessageRules(
  message: string,
  callbacks: {
    onSetTotalRent: (rent: number) => void;
    onSetUtilities: (utilities: number) => void;
    onAddRoommate: (name: string, income: number, roomSize?: number) => void;
    onAddCustomExpense: (name: string, amount: number) => void;
    onSetCurrency: (currency: string) => void;
    onSetSplitMethod: (useRoomSizeSplit: boolean) => void;
  }
): BotResponse {
  const intent = detectIntent(message);
  const lowerMessage = message.toLowerCase();

  // Help responses
  if (intent === 'help-form') {
    return {
      content: `I can help you fill out the form! Just tell me:\n\n` +
        `• Your total monthly rent (e.g., "rent is $2000")\n` +
        `• Monthly utilities (e.g., "utilities are $300")\n` +
        `• Roommate information (e.g., "Alice makes $60k" or "Bob's room is 150 sq ft")\n` +
        `• Any additional expenses (e.g., "Internet is $75")\n\n` +
        `You can tell me all at once or one at a time!`,
    };
  }

  if (intent === 'explain-features') {
    return {
      content: `Rent Splitter helps you split rent and expenses fairly between roommates.\n\n` +
        `**Two Split Methods:**\n` +
        `• **Income-based:** Higher earners pay more (best for couples/families)\n` +
        `• **Room size-based:** Larger rooms pay more, with adjustments for bathrooms, windows, etc. (best for friends/strangers)\n\n` +
        `**Features:**\n` +
        `• Split rent proportionally\n` +
        `• Split utilities evenly\n` +
        `• Add custom expenses\n` +
        `• Generate shareable links\n` +
        `• Support for multiple currencies`,
    };
  }

  if (intent === 'income-vs-room') {
    return {
      content: `Here's the difference between the two split methods:\n\n` +
        `**Income-Based Split:**\n` +
        `• Rent is split based on annual income\n` +
        `• Higher earners pay proportionally more\n` +
        `• Best for: Couples or families living together\n\n` +
        `**Room Size-Based Split:**\n` +
        `• Rent is split based on square footage\n` +
        `• Larger rooms pay more\n` +
        `• You can adjust for: Private bathrooms (+15%), no windows (-10%), flex walls (-5%)\n` +
        `• Best for: Friends or strangers living together\n\n` +
        `Utilities are always split evenly regardless of method!`,
    };
  }

  if (intent === 'general-help') {
    return {
      content: `I can help you with:\n\n` +
        `• Understanding how the app works\n` +
        `• Filling out the form automatically\n` +
        `• Explaining the difference between split methods\n` +
        `• Answering questions about features\n\n` +
        `What would you like to know?`,
    };
  }

  // Autofill logic
  if (intent === 'autofill') {
    const parsedData: ParsedData = {};
    const foundItems: string[] = [];

    // Extract rent
    const rent = extractRent(message);
    if (rent) {
      parsedData.totalRent = rent;
      foundItems.push(`Monthly rent: $${rent.toLocaleString()}`);
    }

    // Extract utilities
    const utilities = extractUtilities(message);
    if (utilities) {
      parsedData.utilities = utilities;
      foundItems.push(`Utilities: $${utilities.toLocaleString()}`);
    }

    // Extract roommates
    const roommates = extractRoommates(message);
    if (roommates.length > 0) {
      parsedData.roommates = roommates;
      roommates.forEach(rm => {
        if (rm.income) {
          foundItems.push(`Roommate: ${rm.name} (income: $${rm.income.toLocaleString()})`);
        }
        if (rm.roomSize) {
          foundItems.push(`Roommate: ${rm.name} (room size: ${rm.roomSize} sq ft)`);
        }
      });
    }

    // Extract custom expenses
    const expenses = extractCustomExpenses(message);
    if (expenses.length > 0) {
      parsedData.customExpenses = expenses;
      expenses.forEach(exp => {
        foundItems.push(`Expense: ${exp.name} ($${exp.amount.toLocaleString()})`);
      });
    }

    // Check for split method preference
    if (lowerMessage.match(/(?:income|salary|earn)/i) && lowerMessage.match(/(?:based|split)/i)) {
      parsedData.useRoomSizeSplit = false;
    } else if (lowerMessage.match(/(?:room|size|square|sq\s*ft)/i)) {
      parsedData.useRoomSizeSplit = true;
    }

    // Check for currency
    const currencyMatch = message.match(/\b(USD|EUR|GBP|CAD|AUD|JPY)\b/i);
    if (currencyMatch) {
      parsedData.currency = currencyMatch[1].toUpperCase();
    }

    if (foundItems.length > 0) {
      return {
        content: `I found the following information:\n\n${foundItems.join('\n')}\n\n` +
          `Would you like me to fill this in? (Say "yes" or "fill it in" to confirm)`,
        parsedData,
        autofill: () => {
          // Fill in order: rent first, then utilities, then roommates
          if (parsedData.totalRent) callbacks.onSetTotalRent(parsedData.totalRent);
          if (parsedData.utilities) callbacks.onSetUtilities(parsedData.utilities);
          
          // Validate and add roommates - ensure names are present
          if (parsedData.roommates) {
            parsedData.roommates.forEach(rm => {
              // CRITICAL: Ensure name is present before adding/updating
              if (rm.name && rm.name.trim()) {
                callbacks.onAddRoommate(rm.name, rm.income || 0, rm.roomSize);
              } else {
                console.warn('Skipping roommate: name is missing or empty');
              }
            });
          }
          
          // Validate and add expenses - ensure names are present
          if (parsedData.customExpenses) {
            parsedData.customExpenses.forEach(exp => {
              // CRITICAL: Ensure name and valid amount are present
              if (exp.name && exp.name.trim() && exp.amount > 0) {
                callbacks.onAddCustomExpense(exp.name, exp.amount);
              } else {
                console.warn(`Skipping expense: name or amount is invalid (name: ${exp.name}, amount: ${exp.amount})`);
              }
            });
          }
          
          if (parsedData.currency) callbacks.onSetCurrency(parsedData.currency);
          if (parsedData.useRoomSizeSplit !== undefined) {
            callbacks.onSetSplitMethod(parsedData.useRoomSizeSplit);
          }
        },
      };
    } else {
      return {
        content: `I couldn't find any rent or roommate information in your message. Could you try telling me:\n\n` +
          `• "Rent is $2000"\n` +
          `• "Utilities are $300"\n` +
          `• "Alice makes $60k"\n` +
          `• "Bob's room is 150 sq ft"\n\n` +
          `Or say "help" for more guidance!`,
      };
    }
  }

  // Check for confirmation
  if (lowerMessage.match(/(?:yes|yeah|yep|sure|ok|okay|fill|go ahead|do it)/i)) {
    return {
      content: `I'm ready to help! Tell me your rent information, roommate details, or ask me a question about how the app works.`,
    };
  }

  // Default response
  return {
    content: `I'm here to help! I can:\n\n` +
      `• Help you fill out the form automatically\n` +
      `• Explain how the app works\n` +
      `• Answer questions about features\n\n` +
      `Try saying "help me fill the form" or ask me a question!`,
  };
}

/**
 * Check if message is a confirmation to autofill
 */
export function isConfirmation(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.match(/(?:yes|yeah|yep|sure|ok|okay|fill|go ahead|do it|confirm)/i) !== null;
}

