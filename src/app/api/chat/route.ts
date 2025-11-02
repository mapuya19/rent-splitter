import { NextRequest, NextResponse } from 'next/server';

const MODEL_API_KEY = process.env.MODEL_API_KEY;
const MODEL_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!MODEL_API_KEY) {
  console.error('MODEL_API_KEY environment variable is not set');
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, currentState } = await request.json();

    const systemPrompt = `You help with a rent-splitting calculator. Reply with ONE JSON object only (no markdown, no prose before/after) using this shape:
{
  "response": "friendly natural-language reply (never restate JSON/form values)",
  "data": {
    "totalRent": number,
    "utilities": number,
    "roommates": [{"name": "string", "income": number, "roomSize": number}],
    "customExpenses": [{"name": "string", "amount": number}],
    "removeRoommates": ["string"],
    "removeCustomExpenses": ["string"],
    "currency": "USD"|"EUR"|"GBP"|"CAD"|"AUD"|"JPY"|"CHF"|"SEK"|"NOK"|"DKK"|"PLN"|"CZK"|"HUF"|"BRL"|"MXN"|"INR"|"CNY"|"KRW"|"SGD"|"HKD"|"NZD"|"ZAR"|"TRY"|"RUB"|"AED"|"EGP"|"THB"|"PHP"|"IDR"|"MYR"|"VND",
    "useRoomSizeSplit": boolean
  }
}

Key rules:
- Always read the provided state first; update existing roommates/expenses instead of creating duplicates.
- CRITICAL NAME REQUIREMENT: User's name MUST be provided FIRST before accepting any income/roomSize data. If user says "my income is X" or "mine is X" without telling you their name, ask "What's your name? I need to know who this belongs to." Do NOT create roommates with placeholder names like "you", "your name", "unknown", "user", "me", "I".
- "My name is X" (or similar) MUST add/update roommate X immediately. This is REQUIRED before accepting income/roomSize for that person.
- When renaming from placeholder names ("you", "your name", etc.) to actual name: add new name with existing data, include old placeholder in removeRoommates. Example: If "your name" exists with income $60k, and user says "my name is matthew", respond with {"roommates": [{"name": "matthew", "income": 60000}], "removeRoommates": ["your name"]}.
- Pronouns ("my", "mine", "I", "me") refer to the user's roommate entry ONLY if you know their name from conversation. If unknown, ask for name first - DO NOT guess or use placeholders.
- Income is annual. Convert "$5k/month" → 60000, "$1k/week" → 52000. Clarify if uncertain.
- To rename a roommate/expense: add the new name with existing data, and include the old name in removeRoommates/removeCustomExpenses.
- To add/update monthly expenses: use customExpenses array. Update existing expenses by matching name (case-insensitive).
- Split method: If adding roommates with roomSize (not income), set useRoomSizeSplit=true. If adding with income (not roomSize), set useRoomSizeSplit=false. If user explicitly requests "room size split" or "income split", set accordingly.
- Currency: When user requests to change currency (e.g., "change to EUR", "use pounds", "switch to Japanese Yen"), set the currency field to the appropriate 3-letter code (e.g., "EUR", "GBP", "JPY"). You can recognize currencies by name, symbol, or code. If user says "remove currency" or "reset currency", set it to "USD" (default).
- If rent is 0, remind the user to set rent before other fields.
- When the user confirms an action ("yes", "go ahead", etc.), include the data immediately.`;

    // Add current form state to context if provided
    let stateContext = '';
    if (currentState) {
      const { totalRent, utilities, roommates, customExpenses, currency, useRoomSizeSplit } = currentState;
      const existingRoommates = roommates?.map((r: { name: string; income?: number; roomSize?: number }) => 
        `${r.name}${r.income ? ` (income: $${r.income.toLocaleString()})` : ''}${r.roomSize ? ` (room size: ${r.roomSize} sq ft)` : ''}`
      ).join(', ') || 'none';
      const existingExpenses = customExpenses?.map((e: { name: string; amount: number }) => `${e.name}: $${e.amount.toLocaleString()}`).join(', ') || 'none';
      
      const rentStatus = totalRent > 0 ? 'SET' : 'NOT SET (REQUIRED)';
      const rentWarning = totalRent <= 0 ? '\n⚠️ WARNING: Rent is not set! Users should set rent BEFORE adding roommates.' : '';
      
      // Check for placeholder names that need to be renamed
      const placeholderNames = ['you', 'your name', 'unknown', 'user', 'me', 'i'];
      const hasPlaceholderRoommate = roommates?.some((r: { name: string; income?: number; roomSize?: number }) => 
        placeholderNames.includes(r.name.trim().toLowerCase())
      );
      const placeholderWarning = hasPlaceholderRoommate 
        ? '\n⚠️ WARNING: Found placeholder roommate name(s) ("you", "your name", etc.). If user provides their actual name, rename the placeholder by adding new name with existing data and removing the placeholder.' 
        : '';
      
      stateContext = `\n\nCURRENT FORM STATE:\n` +
        `- Total Rent: $${totalRent || 0} [${rentStatus}]${rentWarning}\n` +
        `- Utilities: $${utilities || 0}\n` +
        `- Roommates: ${existingRoommates}\n` +
        `- Custom Expenses: ${existingExpenses}\n` +
        `- Currency: ${currency || 'USD'}\n` +
        `- Split Method: ${useRoomSizeSplit ? 'Room Size' : 'Income'}${placeholderWarning}`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt + stateContext },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    if (!MODEL_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set MODEL_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const response = await fetch(MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODEL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError: unknown;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = errorText;
      }

      const requestId = response.headers.get('x-request-id') || undefined;
      console.error('Model API error', {
        status: response.status,
        statusText: response.statusText,
        requestId,
        body: parsedError,
      });
      
      // If it's a model ID error, try to provide helpful information
      if (response.status === 400) {
        const errorMessage =
          typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError
            ? (parsedError as { error?: { message?: string } }).error?.message
            : undefined;

        if (errorMessage?.includes('not a valid model')) {
          console.error('Model ID error. Current model: llama-3.1-8b-instant');
          console.error('Available Groq models: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768, openai/gpt-oss-20b');
        }
      }
      
      return NextResponse.json(
        {
          error: 'Failed to get response from AI',
          details: parsedError,
          requestId,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    // Extract JSON from the response - handle cases where JSON is in code blocks or mixed with text
    let parsedResponse: { 
      response?: string; 
      content?: string; 
      data?: {
        totalRent?: number;
        utilities?: number;
        roommates?: Array<{ name: string; income?: number; roomSize?: number }>;
        customExpenses?: Array<{ name: string; amount: number }>;
        removeRoommates?: string[];
        removeCustomExpenses?: string[];
        currency?: string;
        useRoomSizeSplit?: boolean;
      };
    } = {};
    let cleanMessage = assistantMessage.trim();
    
    // First, try to extract JSON from markdown code blocks (even if there's text before/after)
    const jsonCodeBlockMatch = cleanMessage.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonCodeBlockMatch) {
      cleanMessage = jsonCodeBlockMatch[1].trim();
    }
    
    // Try to find JSON object in the message (handles cases where JSON is embedded in text)
    const jsonObjectMatch = cleanMessage.match(/\{[\s\S]*"response"[\s\S]*\}/);
    if (jsonObjectMatch) {
      cleanMessage = jsonObjectMatch[0];
    }
    
    // Try to parse as JSON
    try {
      parsedResponse = JSON.parse(cleanMessage);
    } catch {
      // If parsing fails, try parsing the entire original message
      try {
        parsedResponse = JSON.parse(assistantMessage.trim());
      } catch {
        // If still not JSON, treat as plain text response
        parsedResponse = { response: assistantMessage };
      }
    }

    // Use the response field from JSON, or fall back to the original message
    const responseText = parsedResponse.response || parsedResponse.content || assistantMessage;

    return NextResponse.json({
      content: responseText,
      parsedData: parsedResponse.data || undefined,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

