/**
 * Tests for the Chat API route
 */

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = jest.fn();

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn().mockResolvedValue(data),
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
    })),
  },
}));

describe('Chat API Route', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.MODEL_API_KEY;
    // Suppress console.error for tests
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    console.error = originalConsoleError;
  });

  const createMockRequest = (body: { message?: string; conversationHistory?: Array<{ role: string; content: string }>; currentState?: unknown }): NextRequest => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  const createMockResponse = (data: unknown, ok: boolean = true) => {
    return {
      ok,
      json: jest.fn().mockResolvedValue(data),
      text: jest.fn().mockResolvedValue(JSON.stringify(data)),
      status: ok ? 200 : 400,
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    };
  };

  describe('POST /api/chat', () => {
    it('should return a successful response with parsed data', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              response: 'I found your rent information!',
              data: {
                totalRent: 2000,
                utilities: 300,
              },
            }),
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'My rent is $2000 and utilities are $300',
        conversationHistory: [],
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.content).toBe('I found your rent information!');
      expect(responseData.parsedData).toEqual({
        totalRent: 2000,
        utilities: 300,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('llama-3.1-8b-instant'),
        })
      );
    });

    it('should extract JSON from code blocks even when there is text before it', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: `I found the roommate's name, which is Kezia, and their annual income, which is $62,000.

Here's what I have so far:

\`\`\`json
{
  "response": "I've extracted some information about your rent and roommate.",
  "data": {
    "totalRent": 3356,
    "roommates": [{"name": "Kezia", "income": 62000}],
    "currency": "USD",
    "useRoomSizeSplit": false
  }
}
\`\`\`

Is this information accurate?`,
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Rent is $3356, Kezia makes $62k',
        conversationHistory: [],
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.content).toBe("I've extracted some information about your rent and roommate.");
      expect(responseData.parsedData).toEqual({
        totalRent: 3356,
        roommates: [{ name: 'Kezia', income: 62000 }],
        currency: 'USD',
        useRoomSizeSplit: false,
      });
    });

    it('should handle plain text responses (non-JSON)', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: 'This is a plain text response without JSON',
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.content).toBe('This is a plain text response without JSON');
    });

    it('should include conversation history in API request', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              response: 'Following up on your question',
              data: {},
            }),
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Tell me more',
        conversationHistory: [
          { role: 'user', content: 'What is rent splitting?' },
          { role: 'assistant', content: 'Rent splitting is...' },
        ],
      });

      await POST(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.messages.length).toBeGreaterThan(2); // System + history + new message
      expect(requestBody.messages[requestBody.messages.length - 1].content).toBe('Tell me more');
    });

    it('should handle API errors gracefully', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const errorResponse = {
        error: {
          message: 'Invalid API key',
          code: 401,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(errorResponse, false)
      );

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Failed to get response from AI');
    });

    it('should handle network errors', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error');
    });

    it('should handle missing message field', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const request = createMockRequest({
        conversationHistory: [],
      });

      const response = await POST(request);

      // Should still make API call but with undefined message
      expect(global.fetch).toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('should parse complex roommate data correctly', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              response: 'I found roommate information',
              data: {
                roommates: [
                  { name: 'Alice', income: 60000 },
                  { name: 'Bob', roomSize: 150 },
                ],
                customExpenses: [
                  { name: 'Internet', amount: 75 },
                ],
              },
            }),
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Alice makes $60k, Bob\'s room is 150 sq ft, Internet is $75',
        conversationHistory: [],
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData.parsedData?.roommates).toHaveLength(2);
      expect(responseData.parsedData?.roommates[0].name).toBe('Alice');
      expect(responseData.parsedData?.roommates[0].income).toBe(60000);
      expect(responseData.parsedData?.roommates[1].name).toBe('Bob');
      expect(responseData.parsedData?.roommates[1].roomSize).toBe(150);
      expect(responseData.parsedData?.customExpenses).toHaveLength(1);
    });

    it('should use API key from environment', async () => {
      // Set API key for this test
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              response: 'Test',
              data: {},
            }),
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      await POST(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      // Should contain Bearer token from environment configuration
      expect(fetchCall[1].headers.Authorization).toContain('Bearer');
      expect(fetchCall[1].headers.Authorization.length).toBeGreaterThan(10);
    });

    it('should include optimized system prompt with all critical rules', async () => {
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              response: 'Test',
              data: {},
            }),
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
        currentState: {
          totalRent: 2000,
          roommates: [{ name: 'Alice', income: 60000 }],
        },
      });

      await POST(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const systemMessage = requestBody.messages.find((m: { role: string }) => m.role === 'system');
      
      expect(systemMessage).toBeDefined();
      const prompt = systemMessage.content;
      
      // Verify critical rules are present
      expect(prompt).toContain('JSON object only');
      expect(prompt).toContain('update existing roommates');
      expect(prompt).toContain('CRITICAL NAME REQUIREMENT');
      expect(prompt).toContain('MUST be provided FIRST');
      expect(prompt).toContain('My name is X');
      expect(prompt).toContain('Income is annual');
      expect(prompt).toContain('rename');
      expect(prompt).toContain('rent before other fields');
      // Verify rename and expense rules are explicitly mentioned
      expect(prompt).toContain('rename a roommate/expense');
      expect(prompt).toContain('customExpenses');
      expect(prompt).toContain('monthly expenses');
      // Verify split method auto-detection rule
      expect(prompt).toContain('Split method');
      expect(prompt).toContain('roomSize');
      expect(prompt).toContain('income');
      
      // Verify state context is included
      expect(prompt).toContain('CURRENT FORM STATE');
      expect(prompt).toContain('Total Rent: $2000');
      expect(prompt).toContain('Alice');
      
      // Verify prompt is optimized (shorter than original)
      // Original was ~2500+ tokens, optimized should be ~500-800 tokens
      const promptLength = prompt.length;
      expect(promptLength).toBeLessThan(3000); // Much shorter than original
      expect(promptLength).toBeGreaterThan(200); // But still contains necessary info
    });

    it('should include placeholder name warning when placeholder names exist', async () => {
      process.env.MODEL_API_KEY = 'test-api-key';
      
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              response: 'Test',
              data: {},
            }),
          },
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(mockLLMResponse)
      );

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
        currentState: {
          totalRent: 2000,
          roommates: [{ name: 'your name', income: 60000 }],
        },
      });

      await POST(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const systemMessage = requestBody.messages.find((m: { role: string }) => m.role === 'system');
      
      expect(systemMessage).toBeDefined();
      const prompt = systemMessage.content;
      
      // Verify placeholder warning is included
      expect(prompt).toContain('placeholder');
      expect(prompt).toContain('your name');
      
      // Verify critical name requirement rule is present
      expect(prompt).toContain('CRITICAL NAME REQUIREMENT');
      expect(prompt).toContain('MUST be provided FIRST');
    });
  });
});

