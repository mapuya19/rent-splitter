import { NextRequest, NextResponse } from 'next/server';

const GLM_API_KEY = process.env.GLM_API_KEY || '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';
const GLM_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    const systemPrompt = `You are a helpful assistant for a rent splitting calculator app. Your job is to:
1. Help users understand how to use the app
2. Extract information from their messages to fill out the form
3. Provide friendly, clear responses

CRITICAL: When users provide information, you MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Format your response as a JSON object with this EXACT structure:
{
  "response": "Your natural language response. If you found data to extract, mention what you found and ask if they want you to fill it in.",
  "data": {
    "totalRent": number (if mentioned, e.g. 2000),
    "utilities": number (if mentioned, e.g. 300),
    "roommates": [{"name": "string", "income": number (optional), "roomSize": number (optional)}],
    "customExpenses": [{"name": "string", "amount": number}],
    "currency": "USD" | "EUR" | "GBP" | "CAD" | "AUD" (if mentioned),
    "useRoomSizeSplit": boolean (true if room size mentioned, false if income mentioned)
  }
}

IMPORTANT RULES: 
- Return ONLY the JSON object, nothing else
- Do NOT wrap JSON in markdown code blocks
- Do NOT add any text before or after the JSON
- If no data is extracted, include "data": {} with empty object
- For roommates, income should be annual salary (e.g., 60000 for $60k)
- Room size should be in square feet
- Be conversational and helpful in your "response" field text
- If extracting data, clearly list what you found and ask for confirmation`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
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
    let parsedResponse: { response?: string; content?: string; data?: any } = {};
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

