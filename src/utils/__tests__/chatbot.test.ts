/**
 * Tests for chatbot utility functions
 */

import { processChatbotMessage, isConfirmation } from '@/utils/chatbot';

// Mock fetch globally
global.fetch = jest.fn();

describe('Chatbot Utils', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('processChatbotMessage', () => {
    const mockCallbacks = {
      onSetTotalRent: jest.fn(),
      onSetUtilities: jest.fn(),
      onAddRoommate: jest.fn(),
      onAddCustomExpense: jest.fn(),
      onSetCurrency: jest.fn(),
      onSetSplitMethod: jest.fn(),
    };

    it('should successfully process a message with LLM API', async () => {
      const mockApiResponse = {
        content: 'I found your rent information!',
        parsedData: {
          totalRent: 2000,
          utilities: 300,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'My rent is $2000',
        [],
        mockCallbacks
      );

      expect(result.content).toBe('I found your rent information!');
      expect(result.parsedData).toEqual({
        totalRent: 2000,
        utilities: 300,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should create autofill function when data is extracted', async () => {
      const mockApiResponse = {
        content: 'I found some information',
        parsedData: {
          totalRent: 2000,
          utilities: 300,
          roommates: [
            { name: 'Alice', income: 60000 },
          ],
          customExpenses: [
            { name: 'Internet', amount: 75 },
          ],
          currency: 'USD',
          useRoomSizeSplit: false,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Rent is $2000, utilities $300, Alice makes $60k, Internet is $75',
        [],
        mockCallbacks
      );

      expect(result.autofill).toBeDefined();
      
      // Execute autofill
      result.autofill!();

      expect(mockCallbacks.onSetTotalRent).toHaveBeenCalledWith(2000);
      expect(mockCallbacks.onSetUtilities).toHaveBeenCalledWith(300);
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Alice', 60000, undefined);
      expect(mockCallbacks.onAddCustomExpense).toHaveBeenCalledWith('Internet', 75);
      expect(mockCallbacks.onSetCurrency).toHaveBeenCalledWith('USD');
      expect(mockCallbacks.onSetSplitMethod).toHaveBeenCalledWith(false);
    });

    it('should handle API errors and fallback to rules-based approach', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'API error' }),
      });

      const result = await processChatbotMessage(
        'Help me fill the form',
        [],
        mockCallbacks
      );

      // Should fallback to rules-based response
      expect(result.content).toContain('I can help you fill out the form');
      expect(result.content).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await processChatbotMessage(
        'Hello',
        [],
        mockCallbacks
      );

      // Should fallback to rules-based response
      expect(result.content).toBeDefined();
    });

    it('should pass conversation history to API', async () => {
      const mockApiResponse = {
        content: 'Following up',
        parsedData: {},
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const conversationHistory = [
        { role: 'user' as const, content: 'What is rent splitting?' },
        { role: 'bot' as const, content: 'Rent splitting is...' },
      ];

      await processChatbotMessage(
        'Tell me more',
        conversationHistory,
        mockCallbacks
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.conversationHistory).toHaveLength(2);
      expect(requestBody.conversationHistory[0].role).toBe('user');
      expect(requestBody.conversationHistory[1].role).toBe('assistant');
    });

    it('should not create autofill function when no data is extracted', async () => {
      const mockApiResponse = {
        content: 'I can help you!',
        parsedData: {},
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Hello',
        [],
        mockCallbacks
      );

      expect(result.autofill).toBeUndefined();
    });

    it('should handle roommates with both income and room size', async () => {
      const mockApiResponse = {
        content: 'Found roommate info',
        parsedData: {
          roommates: [
            { name: 'Alice', income: 60000, roomSize: 150 },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Alice makes $60k and her room is 150 sq ft',
        [],
        mockCallbacks
      );

      expect(result.autofill).toBeDefined();
      result.autofill!();

      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Alice', 60000, 150);
    });
  });

  describe('isConfirmation', () => {
    it('should recognize yes confirmations', () => {
      expect(isConfirmation('yes')).toBe(true);
      expect(isConfirmation('Yes')).toBe(true);
      expect(isConfirmation('YES')).toBe(true);
      expect(isConfirmation('yeah')).toBe(true);
      expect(isConfirmation('yep')).toBe(true);
      expect(isConfirmation('sure')).toBe(true);
      expect(isConfirmation('ok')).toBe(true);
      expect(isConfirmation('okay')).toBe(true);
    });

    it('should recognize fill confirmations', () => {
      expect(isConfirmation('fill it in')).toBe(true);
      expect(isConfirmation('go ahead')).toBe(true);
      expect(isConfirmation('do it')).toBe(true);
      expect(isConfirmation('confirm')).toBe(true);
    });

    it('should not recognize non-confirmations', () => {
      expect(isConfirmation('no')).toBe(false);
      expect(isConfirmation('maybe')).toBe(false);
      expect(isConfirmation('later')).toBe(false);
      expect(isConfirmation('cancel')).toBe(false);
      expect(isConfirmation('')).toBe(false);
    });

    it('should handle confirmation phrases', () => {
      expect(isConfirmation('yes please')).toBe(true);
      expect(isConfirmation('sure, go ahead')).toBe(true);
      expect(isConfirmation('ok fill it')).toBe(true);
    });
  });
});

