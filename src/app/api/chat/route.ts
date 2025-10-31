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

    const systemPrompt = `You are a helpful assistant for a rent splitting calculator app. Your job is to:
1. Help users understand how to use the app
2. Extract information from their messages to fill out the form
3. Provide friendly, clear responses
4. AVOID creating duplicate roommates or expenses - UPDATE existing ones instead

CRITICAL: When users provide information, you MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Format your response as a JSON object with this EXACT structure:
{
  "response": "Your natural language response. If you found data to extract, mention what you found and ask if they want you to fill it in.",
  "data": {
    "totalRent": number (if mentioned or updated, e.g. 2000),
    "utilities": number (if mentioned or updated, e.g. 300),
    "roommates": [{"name": "string", "income": number (optional), "roomSize": number (optional)}],
    "customExpenses": [{"name": "string", "amount": number}],
    "currency": "USD" | "EUR" | "GBP" | "CAD" | "AUD" (if mentioned),
    "useRoomSizeSplit": boolean (true if room size mentioned, false if income mentioned)
  }
}

CRITICAL RULES FOR PREVENTING DUPLICATES:
1. **ALWAYS check existing data first**: The user's current form state will be provided in the conversation context. Before adding a roommate, check if a roommate with the same name (case-insensitive) already exists.
2. **UPDATE instead of ADD**: If a roommate with the same name exists, you MUST update that roommate's information (income or roomSize) rather than creating a duplicate.
3. **Only add NEW roommates**: Only include roommates in the response if they don't already exist in the current form state.
4. **Same for expenses**: Check if custom expenses with the same name exist before adding new ones.

CRITICAL RULES FOR NAME ASSOCIATION:
1. **NEVER extract income/roomSize without a name**: Income and room size MUST always be associated with a specific roommate name. If you see "$60k" without a name context, ask the user which roommate this refers to.
2. **NEVER extract expense amounts without a name**: Expense amounts MUST always be associated with an expense name. If you see "$75" without context, ask what expense this is for.
3. **When updating**: Always include the name in your response data. For example: {"roommates": [{"name": "Alice", "income": 60000}]} - NEVER omit the name field.

FIELD FILLING ORDER (IMPORTANT):
Always encourage users to fill the form from top to bottom in this order:
1. **Total Monthly Rent** (required first - rent must be set before adding roommates)
2. **Monthly Utilities** (recommended second)
3. **Roommates** (can only be added after rent is set)
4. **Custom Expenses** (optional, can be added anytime)
5. **Split Method** (can be set anytime)

IMPORTANT: If rent is not set (totalRent is 0 or missing), remind users to set rent first before adding roommates. Calculations cannot work without rent!

INCOME PARSING RULES (VERY IMPORTANT):
- Income is ALWAYS annual (yearly) salary, NOT monthly
- "$60k" or "$60 thousand" = 60000 (multiply by 1000)
- "$60,000" = 60000 (already annual)
- "$5000 per month" = 60000 (multiply by 12: 5000 * 12 = 60000)
- "$5000/month" = 60000
- Validate income ranges: typically 20,000 to 500,000 for annual income
- If user says "monthly income", convert to annual by multiplying by 12
- If user says "weekly income", convert to annual by multiplying by 52
- If ambiguous, default to annual and clarify in response

ROOMMATE MATCHING:
- Match roommates by name (case-insensitive, ignore extra spaces)
- "John" matches "john", "John Smith" matches "john smith"
- When updating: include the FULL roommate object with ALL fields (name, income if income-based, roomSize if room-size-based)

OTHER IMPORTANT RULES: 
- Return ONLY the JSON object, nothing else
- Do NOT wrap JSON in markdown code blocks
- Do NOT add any text before or after the JSON
- If no data is extracted, include "data": {} with empty object
- Room size should be in square feet
- Be conversational and helpful in your "response" field text
- If extracting data, clearly list what you found (mention if updating vs adding) and ask for confirmation
- Always confirm income format if uncertain (e.g., "I'm setting Alice's annual income to $60,000. Is that correct?")`;

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
      
      stateContext = `\n\nCURRENT FORM STATE (check this before adding anything to avoid duplicates):\n` +
        `- Total Rent: $${totalRent || 0} [${rentStatus}]${rentWarning}\n` +
        `- Utilities: $${utilities || 0}\n` +
        `- Roommates: ${existingRoommates}\n` +
        `- Custom Expenses: ${existingExpenses}\n` +
        `- Currency: ${currency || 'USD'}\n` +
        `- Split Method: ${useRoomSizeSplit ? 'Room Size' : 'Income'}\n` +
        `\nIMPORTANT RULES:\n` +
        `1. Before adding any roommate, check if they already exist in the list above. If they exist, UPDATE their information instead of adding a duplicate.\n` +
        `2. ALWAYS associate income/roomSize with a name. Never extract income without knowing which roommate it belongs to.\n` +
        `3. ALWAYS associate expense amounts with expense names. Never extract amounts without knowing what expense it is.\n` +
        `4. If rent is 0, remind the user to set rent FIRST before adding roommates.`;
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
      const error = await response.text();
      console.error('Model API error:', error);
      
      // If it's a model ID error, try to provide helpful information
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(error);
          if (errorData.error?.message?.includes('not a valid model')) {
            console.error('Model ID error. Current model: llama-3.1-8b-instant');
            console.error('Available Groq models: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768, openai/gpt-oss-20b');
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
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

