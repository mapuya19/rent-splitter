interface ParsedData {
  totalRent?: number;
  utilities?: number;
  roommates?: Array<{ name: string; income?: number; roomSize?: number }>;
  customExpenses?: Array<{ name: string; amount: number }>;
  removeRoommates?: string[];
  removeCustomExpenses?: string[];
  currency?: string;
  useRoomSizeSplit?: boolean;
}

interface BotResponse {
  content: string;
  autofill?: () => void;
  parsedData?: ParsedData;
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
    onRemoveRoommate: (name: string) => void;
    onRemoveCustomExpense: (name: string) => void;
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

    // Retry logic for rate limiting (429 responses)
    const maxRetries = 3;
    let retryAfter = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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

      // Handle rate limiting (429) with retry
      if (response.status === 429) {
        const errorText = await response.text();
        let errorDetails: unknown;
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = errorText;
        }

        const retryAfterHeader = response.headers.get('Retry-After');
        retryAfter = retryAfterHeader 
          ? parseInt(retryAfterHeader, 10) 
          : (typeof errorDetails === 'object' && errorDetails !== null && 'retryAfter' in errorDetails
              ? (errorDetails as { retryAfter?: number }).retryAfter || 5
              : 5);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitMs = retryAfter * 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        } else {
          // Max retries reached
          throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorDetails: unknown;
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = errorText || `HTTP ${response.status}`;
        }

        console.error('Model API request failed', {
          status: response.status,
          statusText: response.statusText,
          body: errorDetails,
        });

        const errorMessage =
          typeof errorDetails === 'object' && errorDetails !== null && 'error' in errorDetails
            ? (errorDetails as { error?: string }).error || 'API request failed'
            : typeof errorDetails === 'string'
              ? errorDetails
              : 'API request failed';

        throw new Error(errorMessage);
      }

      // Success - process response
      const data = await response.json();
      const parsedData = data.parsedData as ParsedData | undefined;

      const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
      const formatSqFt = (value: number) => `${value} sq ft`;
      const normalizeName = (name: string) => name.trim().toLowerCase();

      const existingRoommatesMap = new Map<string, { name: string; income?: number; roomSize?: number }>();
      currentState?.roommates?.forEach(roommate => {
        if (roommate.name && roommate.name.trim()) {
          existingRoommatesMap.set(normalizeName(roommate.name), roommate);
        }
      });

      // Create autofill function if data was extracted
      let autofill: (() => void) | undefined;
      if (parsedData && Object.keys(parsedData).length > 0) {
        const foundItems: string[] = [];
      
        // Track renames to avoid showing them as separate add/remove operations
        const roommateRenames = new Map<string, string>(); // old name -> new name
        const expenseRenames = new Map<string, string>(); // old name -> new name
      
        // Detect roommate renames (when removing and adding with same/similar data)
        if (parsedData.removeRoommates && parsedData.roommates) {
          parsedData.removeRoommates.forEach(oldName => {
            const normalizedOldName = normalizeName(oldName);
            const existing = existingRoommatesMap.get(normalizedOldName);
            
            if (existing) {
              // Check if we're adding a roommate with the same income/roomSize
              const matchingNewRoommate = parsedData.roommates!.find(rm => {
                const normalizedNewName = normalizeName(rm.name);
                return normalizedNewName !== normalizedOldName && 
                       ((rm.income && rm.income === existing.income) || 
                        (rm.roomSize && rm.roomSize === existing.roomSize));
              });
              
              if (matchingNewRoommate) {
                roommateRenames.set(normalizedOldName, matchingNewRoommate.name);
              }
            }
          });
        }
      
        // Detect expense renames
        const existingExpensesMap = new Map<string, number>();
        currentState?.customExpenses?.forEach(exp => {
          if (exp.name && exp.name.trim()) {
            existingExpensesMap.set(normalizeName(exp.name), exp.amount);
          }
        });
        
        if (parsedData.removeCustomExpenses && parsedData.customExpenses) {
          parsedData.removeCustomExpenses.forEach(oldName => {
            const normalizedOldName = normalizeName(oldName);
            const existingAmount = existingExpensesMap.get(normalizedOldName);
            
            if (existingAmount) {
              const matchingNewExpense = parsedData.customExpenses!.find(exp => {
                const normalizedNewName = normalizeName(exp.name);
                return normalizedNewName !== normalizedOldName && exp.amount === existingAmount;
              });
              
              if (matchingNewExpense) {
                expenseRenames.set(normalizedOldName, matchingNewExpense.name);
              }
            }
          });
        }
      
        if (parsedData.totalRent) {
          foundItems.push(`Monthly rent: $${parsedData.totalRent.toLocaleString()}`);
        }
        if (parsedData.utilities) {
          foundItems.push(`Utilities: $${parsedData.utilities.toLocaleString()}`);
        }
        if (parsedData.currency) {
          const currentCurrency = currentState?.currency || 'USD';
          const newCurrency = parsedData.currency;
          if (currentCurrency !== newCurrency) {
            foundItems.push(`Change currency: ${currentCurrency} → ${newCurrency}`);
          } else {
            foundItems.push(`Currency: ${newCurrency}`);
          }
        }
        if (parsedData.roommates && parsedData.roommates.length > 0) {
          parsedData.roommates.forEach(rm => {
            if (!rm.name || !rm.name.trim()) {
              return;
            }

            const normalized = normalizeName(rm.name);
            const existing = existingRoommatesMap.get(normalized);
            
            // Check if this is the target of a rename operation
            const isRenameTarget = Array.from(roommateRenames.values()).some(
              newName => normalizeName(newName) === normalized
            );
            
            if (isRenameTarget) {
              // This is handled by the rename message below
              return;
            }

            if (existing) {
              const updates: string[] = [];

              if (rm.income && rm.income > 0) {
                if (existing.income && existing.income > 0) {
                  if (existing.income !== rm.income) {
                    updates.push(`income: ${formatCurrency(existing.income)} → ${formatCurrency(rm.income)}`);
                  }
                } else {
                  updates.push(`set income to ${formatCurrency(rm.income)}`);
                }
              }

              if (rm.roomSize && rm.roomSize > 0) {
                if (existing.roomSize && existing.roomSize > 0) {
                  if (existing.roomSize !== rm.roomSize) {
                    updates.push(`room size: ${formatSqFt(existing.roomSize)} → ${formatSqFt(rm.roomSize)}`);
                  }
                } else {
                  updates.push(`set room size to ${formatSqFt(rm.roomSize)}`);
                }
              }

              if (updates.length > 0) {
                foundItems.push(`Update ${rm.name}: ${updates.join('; ')}`);
              }
            } else {
              const summaryParts: string[] = [];
              if (rm.income && rm.income > 0) {
                summaryParts.push(`income ${formatCurrency(rm.income)}`);
              }
              if (rm.roomSize && rm.roomSize > 0) {
                summaryParts.push(`room size ${formatSqFt(rm.roomSize)}`);
              }

              const summary = summaryParts.length > 0 ? ` (${summaryParts.join(', ')})` : '';
              foundItems.push(`Add ${rm.name}${summary}`);
            }
          });
        }
      
        // Show expense operations (excluding renames which will be shown separately)
        if (parsedData.customExpenses && parsedData.customExpenses.length > 0) {
          parsedData.customExpenses.forEach(exp => {
            const isRenameTarget = Array.from(expenseRenames.values()).some(
              newName => normalizeName(newName) === normalizeName(exp.name)
            );
            
            if (!isRenameTarget) {
              foundItems.push(`Expense: ${exp.name} ($${exp.amount.toLocaleString()})`);
            }
          });
        }
      
        // Show roommate renames
        roommateRenames.forEach((newName, oldNameNormalized) => {
          // Find the original casing of the old name
          const oldNameOriginal = Array.from(existingRoommatesMap.values()).find(
            rm => normalizeName(rm.name) === oldNameNormalized
          )?.name || oldNameNormalized;
          
          foundItems.push(`Rename roommate: ${oldNameOriginal} → ${newName}`);
        });
      
        // Show expense renames
        expenseRenames.forEach((newName, oldNameNormalized) => {
          const oldNameOriginal = currentState?.customExpenses?.find(
            exp => normalizeName(exp.name) === oldNameNormalized
          )?.name || oldNameNormalized;
          
          foundItems.push(`Rename expense: ${oldNameOriginal} → ${newName}`);
        });
      
        // Show removals (excluding those that are part of renames)
        if (parsedData.removeRoommates && parsedData.removeRoommates.length > 0) {
          parsedData.removeRoommates.forEach(name => {
            if (name && name.trim()) {
              const normalized = normalizeName(name);
              if (!roommateRenames.has(normalized)) {
                foundItems.push(`Remove roommate: ${name}`);
              }
            }
          });
        }
        if (parsedData.removeCustomExpenses && parsedData.removeCustomExpenses.length > 0) {
          parsedData.removeCustomExpenses.forEach(name => {
            if (name && name.trim()) {
              const normalized = normalizeName(name);
              if (!expenseRenames.has(normalized)) {
                foundItems.push(`Remove expense: ${name}`);
              }
            }
          });
        }

        // Only show confirmation if we found data
        if (foundItems.length > 0) {
          autofill = () => {
            // Set split method FIRST if specified explicitly
            if (parsedData.useRoomSizeSplit !== undefined) {
              callbacks.onSetSplitMethod(parsedData.useRoomSizeSplit);
            } else if (parsedData.roommates && parsedData.roommates.length > 0) {
              // Auto-infer split method based on roommate data
              // Check if any roommate has roomSize (not income) or income (not roomSize)
              const hasRoomSizes = parsedData.roommates.some(rm => rm.roomSize && rm.roomSize > 0 && (!rm.income || rm.income === 0));
              const hasIncomes = parsedData.roommates.some(rm => rm.income && rm.income > 0 && (!rm.roomSize || rm.roomSize === 0));
              
              // Only auto-set if we have a clear indication (all roommates use same type)
              if (hasRoomSizes && !hasIncomes) {
                callbacks.onSetSplitMethod(true); // Room size split
              } else if (hasIncomes && !hasRoomSizes) {
                callbacks.onSetSplitMethod(false); // Income split
              }
              // If mixed or unclear, don't auto-set (let current state persist)
            }
            
            // Fill in order: rent first, then utilities, then roommates
            if (parsedData.totalRent) callbacks.onSetTotalRent(parsedData.totalRent);
            if (parsedData.utilities) callbacks.onSetUtilities(parsedData.utilities);
            
            // Remove roommates FIRST (before adding/updating)
            if (parsedData.removeRoommates) {
              parsedData.removeRoommates.forEach(name => {
                if (name && name.trim()) {
                  callbacks.onRemoveRoommate(name);
                }
              });
            }
            
            // Add roommates - handleAddRoommate now allows incomplete roommates
            if (parsedData.roommates) {
              parsedData.roommates.forEach(rm => {
                // Ensure name is present before adding/updating
                if (rm.name && rm.name.trim()) {
                  // handleAddRoommate will handle updates vs new roommates and allow incomplete data
                  callbacks.onAddRoommate(rm.name, rm.income || 0, rm.roomSize);
                }
              });
            }
            
            // Remove expenses FIRST (before adding/updating)
            if (parsedData.removeCustomExpenses) {
              parsedData.removeCustomExpenses.forEach(name => {
                if (name && name.trim()) {
                  callbacks.onRemoveCustomExpense(name);
                }
              });
            }
            
            // Validate and add expenses - ensure names are present
            if (parsedData.customExpenses) {
              parsedData.customExpenses.forEach(exp => {
                // CRITICAL: Ensure name and valid amount are present
                if (exp.name && exp.name.trim() && exp.amount > 0) {
                  callbacks.onAddCustomExpense(exp.name, exp.amount);
                }
                // Silently skip invalid expenses - don't spam console
              });
            }
            
            if (parsedData.currency) callbacks.onSetCurrency(parsedData.currency);
          };
        }
      }

      return {
        content: data.content || 'I\'m here to help!',
        autofill,
        parsedData,
      };
    }

    // This should never be reached, but TypeScript needs it for type checking
    throw new Error('Unexpected loop completion');
  } catch (error) {
    console.error('LLM API error:', error);
    return {
      content: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact support if the issue continues.',
    };
  }
}

/**
 * Check if message is a confirmation to autofill
 */
export function isConfirmation(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.match(/(?:yes|yeah|yep|sure|ok|okay|fill|go ahead|do it|confirm|update|apply|change it|make it happen|sounds good)/i) !== null;
}

