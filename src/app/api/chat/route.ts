import { NextRequest, NextResponse } from 'next/server';

const GLM_API_KEY = process.env.GLM_API_KEY || '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';
const GLM_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
      
      stateContext = `\n\nCURRENT FORM STATE (check this before adding anything to avoid duplicates):\n` +
        `- Total Rent: $${totalRent || 0}\n` +
        `- Utilities: $${utilities || 0}\n` +
        `- Roommates: ${existingRoommates}\n` +
        `- Custom Expenses: ${existingExpenses}\n` +
        `- Currency: ${currency || 'USD'}\n` +
        `- Split Method: ${useRoomSizeSplit ? 'Room Size' : 'Income'}\n` +
        `\nIMPORTANT: Before adding any roommate, check if they already exist in the list above. If they exist, UPDATE their information instead of adding a duplicate.`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt + stateContext },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GLM_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://rent-splitter.vercel.app',
        'X-Title': 'Rent Splitter',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GLM API error:', error);
      
      // If it's a model ID error, try to provide helpful information
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(error);
          if (errorData.error?.message?.includes('not a valid model')) {
            console.error('Model ID error. Current model:', 'meta-llama/llama-3.3-8b-instruct:free');
            console.error('Alternative models on OpenRouter:');
            console.error('- meta-llama/llama-3.3-8b-instruct:free');
            console.error('- z-ai/glm-4.5-air:free');
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

