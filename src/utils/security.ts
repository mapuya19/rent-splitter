/**
 * Security utilities for chatbot input/output validation and sanitization
 * Prevents prompt injection, XSS, and other security vulnerabilities
 */

// Maximum message length (characters)
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_HISTORY_LENGTH = 50;

// Allowed currency codes (whitelist)
const ALLOWED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
  'PLN', 'CZK', 'HUF', 'BRL', 'MXN', 'INR', 'CNY', 'KRW', 'SGD', 'HKD',
  'NZD', 'ZAR', 'TRY', 'RUB', 'AED', 'EGP', 'THB', 'PHP', 'IDR', 'MYR', 'VND'
];

// Prompt injection patterns (common attack vectors)
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|the)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(previous|all|the)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(previous|all|the)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(a|an)\s+/i,
  /pretend\s+(to\s+be|you\s+are)\s+/i,
  /system\s*:?\s*/i,
  /assistant\s*:?\s*/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /###\s*(system|instruction|prompt)\s*:/i,
  /override\s+(system|instructions?|prompts?)/i,
  /jailbreak/i,
  /new\s+(instructions?|prompts?|rules?)/i,
  /output\s+(the|your)\s+(system|full|entire)\s+(prompt|instructions?)/i,
  /reveal\s+(the|your)\s+(system|full|entire)\s+(prompt|instructions?)/i,
  /show\s+(me\s+)?(the|your)\s+(system|full|entire|original)\s+(prompt|instructions?)/i,
  /what\s+(are|were)\s+(your|the)\s+(system|original|initial)\s+(instructions?|prompts?)/i,
  /repeat\s+(the|your|back)\s+(system|original|initial)\s+(instructions?|prompts?)/i,
];

// Suspicious content patterns
const SUSPICIOUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick=
  /data:text\/html/gi,
  /vbscript:/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

/**
 * Sanitize user input to prevent XSS and other attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate message length
 */
export function validateMessageLength(message: string): { valid: boolean; error?: string } {
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  if (message.length === 0) {
    return {
      valid: false,
      error: 'Message cannot be empty.',
    };
  }
  return { valid: true };
}

/**
 * Detect potential prompt injection attacks
 */
export function detectPromptInjection(message: string): { isInjection: boolean; confidence: 'low' | 'medium' | 'high'; reason?: string } {
  const sanitized = sanitizeInput(message);
  let matchCount = 0;
  let highestConfidence: 'low' | 'medium' | 'high' = 'low';
  const matchedPatterns: string[] = [];

  // Check for prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      matchCount++;
      matchedPatterns.push(pattern.source);
      
      // High confidence patterns
      if (pattern.source.includes('ignore') || 
          pattern.source.includes('forget') ||
          pattern.source.includes('override') ||
          pattern.source.includes('jailbreak') ||
          pattern.source.includes('reveal') ||
          pattern.source.includes('output')) {
        highestConfidence = 'high';
      } else if (pattern.source.includes('you are now') || 
                 pattern.source.includes('act as') ||
                 pattern.source.includes('system:')) {
        if (highestConfidence !== 'high') {
          highestConfidence = 'medium';
        }
      }
    }
  }

  // Check for suspicious content
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      matchCount++;
      if (highestConfidence === 'low') {
        highestConfidence = 'medium';
      }
    }
  }

  // Multiple matches increase confidence
  if (matchCount >= 3) {
    highestConfidence = 'high';
  } else if (matchCount >= 2 && highestConfidence === 'low') {
    highestConfidence = 'medium';
  }

  return {
    isInjection: matchCount > 0,
    confidence: highestConfidence,
    reason: matchCount > 0 
      ? `Detected ${matchCount} suspicious pattern(s): ${matchedPatterns.slice(0, 3).join(', ')}`
      : undefined,
  };
}

/**
 * Validate conversation history structure and content
 */
export function validateConversationHistory(
  history: Array<{ role: string; content: string }>
): { valid: boolean; error?: string; sanitized?: Array<{ role: 'user' | 'assistant'; content: string }> } {
  if (!Array.isArray(history)) {
    return { valid: false, error: 'Conversation history must be an array' };
  }

  if (history.length > MAX_CONVERSATION_HISTORY_LENGTH) {
    return {
      valid: false,
      error: `Conversation history is too long. Maximum ${MAX_CONVERSATION_HISTORY_LENGTH} messages allowed.`,
    };
  }

  const sanitized: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of history) {
    if (!msg || typeof msg !== 'object') {
      continue;
    }

    const role = msg.role === 'user' || msg.role === 'assistant' ? msg.role : null;
    if (!role) {
      continue; // Skip invalid roles
    }

    if (typeof msg.content !== 'string') {
      continue; // Skip invalid content
    }

    const sanitizedContent = sanitizeInput(msg.content);
    if (sanitizedContent.length === 0) {
      continue; // Skip empty messages
    }

    // Check for prompt injection in history
    const injectionCheck = detectPromptInjection(sanitizedContent);
    if (injectionCheck.isInjection && injectionCheck.confidence === 'high') {
      // Skip high-confidence injection attempts in history
      continue;
    }

    // Validate length
    const lengthCheck = validateMessageLength(sanitizedContent);
    if (!lengthCheck.valid) {
      continue; // Skip messages that are too long
    }

    sanitized.push({
      role,
      content: sanitizedContent,
    });
  }

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize parsed data from LLM response
 */
export interface ValidatedParsedData {
  totalRent?: number;
  utilities?: number;
  roommates?: Array<{ name: string; income?: number; roomSize?: number }>;
  customExpenses?: Array<{ name: string; amount: number }>;
  removeRoommates?: string[];
  removeCustomExpenses?: string[];
  currency?: string;
  useRoomSizeSplit?: boolean;
}

export function validateParsedData(data: unknown): {
  valid: boolean;
  error?: string;
  sanitized?: ValidatedParsedData;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Parsed data must be an object' };
  }

  const obj = data as Record<string, unknown>;
  const sanitized: ValidatedParsedData = {};

  // Validate totalRent
  if ('totalRent' in obj) {
    const rent = typeof obj.totalRent === 'number' ? obj.totalRent : Number(obj.totalRent);
    if (!isNaN(rent) && isFinite(rent) && rent >= 0 && rent <= 10000000) {
      sanitized.totalRent = Math.round(rent * 100) / 100; // Round to 2 decimal places
    }
  }

  // Validate utilities
  if ('utilities' in obj) {
    const utilities = typeof obj.utilities === 'number' ? obj.utilities : Number(obj.utilities);
    if (!isNaN(utilities) && isFinite(utilities) && utilities >= 0 && utilities <= 1000000) {
      sanitized.utilities = Math.round(utilities * 100) / 100;
    }
  }

  // Validate roommates
  if ('roommates' in obj && Array.isArray(obj.roommates)) {
    const roommates: Array<{ name: string; income?: number; roomSize?: number }> = [];
    for (const rm of obj.roommates) {
      if (!rm || typeof rm !== 'object') continue;

      const name = typeof rm.name === 'string' ? sanitizeInput(rm.name.trim()) : '';
      if (!name || name.length === 0 || name.length > 100) continue;

      // Check for placeholder names
      const lowerName = name.toLowerCase();
      if (['you', 'your name', 'unknown', 'user', 'me', 'i', 'system', 'assistant'].includes(lowerName)) {
        continue; // Skip placeholder names
      }

      const roommate: { name: string; income?: number; roomSize?: number } = { name };

      if ('income' in rm) {
        const income = typeof rm.income === 'number' ? rm.income : Number(rm.income);
        if (!isNaN(income) && isFinite(income) && income >= 0 && income <= 10000000) {
          roommate.income = Math.round(income);
        }
      }

      if ('roomSize' in rm) {
        const roomSize = typeof rm.roomSize === 'number' ? rm.roomSize : Number(rm.roomSize);
        if (!isNaN(roomSize) && isFinite(roomSize) && roomSize > 0 && roomSize <= 10000) {
          roommate.roomSize = Math.round(roomSize * 100) / 100;
        }
      }

      if (roommate.name) {
        roommates.push(roommate);
      }
    }
    if (roommates.length > 0) {
      sanitized.roommates = roommates;
    }
  }

  // Validate customExpenses
  if ('customExpenses' in obj && Array.isArray(obj.customExpenses)) {
    const expenses: Array<{ name: string; amount: number }> = [];
    for (const exp of obj.customExpenses) {
      if (!exp || typeof exp !== 'object') continue;

      const name = typeof exp.name === 'string' ? sanitizeInput(exp.name.trim()) : '';
      if (!name || name.length === 0 || name.length > 100) continue;

      const amount = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount);
      if (isNaN(amount) || !isFinite(amount) || amount <= 0 || amount > 1000000) {
        continue;
      }

      expenses.push({
        name,
        amount: Math.round(amount * 100) / 100,
      });
    }
    if (expenses.length > 0) {
      sanitized.customExpenses = expenses;
    }
  }

  // Validate removeRoommates
  if ('removeRoommates' in obj && Array.isArray(obj.removeRoommates)) {
    const removeNames: string[] = [];
    for (const name of obj.removeRoommates) {
      if (typeof name === 'string') {
        const sanitized = sanitizeInput(name.trim());
        if (sanitized.length > 0 && sanitized.length <= 100) {
          removeNames.push(sanitized);
        }
      }
    }
    if (removeNames.length > 0) {
      sanitized.removeRoommates = removeNames;
    }
  }

  // Validate removeCustomExpenses
  if ('removeCustomExpenses' in obj && Array.isArray(obj.removeCustomExpenses)) {
    const removeNames: string[] = [];
    for (const name of obj.removeCustomExpenses) {
      if (typeof name === 'string') {
        const sanitized = sanitizeInput(name.trim());
        if (sanitized.length > 0 && sanitized.length <= 100) {
          removeNames.push(sanitized);
        }
      }
    }
    if (removeNames.length > 0) {
      sanitized.removeCustomExpenses = removeNames;
    }
  }

  // Validate currency (whitelist)
  if ('currency' in obj && typeof obj.currency === 'string') {
    const currency = obj.currency.toUpperCase().trim();
    if (ALLOWED_CURRENCIES.includes(currency)) {
      sanitized.currency = currency;
    }
  }

  // Validate useRoomSizeSplit
  if ('useRoomSizeSplit' in obj) {
    sanitized.useRoomSizeSplit = Boolean(obj.useRoomSizeSplit);
  }

  return { valid: true, sanitized };
}

/**
 * Validate response content from LLM
 */
export function validateResponseContent(content: string): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Response content must be a string' };
  }

  const sanitized = sanitizeInput(content);

  // Check length (allow longer responses than input)
  if (sanitized.length > MAX_MESSAGE_LENGTH * 2) {
    return {
      valid: false,
      error: 'Response content is too long',
    };
  }

  // Check for suspicious content
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        error: 'Response contains suspicious content',
      };
    }
  }

  return { valid: true, sanitized };
}

