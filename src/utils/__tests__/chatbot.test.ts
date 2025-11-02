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
      onRemoveRoommate: jest.fn(),
      onRemoveCustomExpense: jest.fn(),
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

    it('should surface helpful message when API responds with error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'API error' }),
      });

      const result = await processChatbotMessage(
        'Help me fill the form',
        [],
        mockCallbacks
      );

      expect(result.content).toContain('Please try again later');
      expect(result.autofill).toBeUndefined();
      expect(result.parsedData).toBeUndefined();
    });

    it('should handle network errors gracefully with guidance message', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await processChatbotMessage(
        'Hello',
        [],
        mockCallbacks
      );

      expect(result.content).toContain('Please try again later');
      expect(result.autofill).toBeUndefined();
      expect(result.parsedData).toBeUndefined();
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

    it('should handle roommate updates using current state context', async () => {
      const mockApiResponse = {
        content: "I've updated Alice's income to $70,000",
        parsedData: {
          roommates: [
            { name: 'Alice', income: 70000 },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Alice now makes $70k',
        [],
        mockCallbacks,
        {
          roommates: [
            { name: 'Alice', income: 60000 },
          ],
        }
      );

      expect(result.content).toBe("I've updated Alice's income to $70,000");
      expect(result.autofill).toBeDefined();
      expect(result.parsedData?.roommates).toEqual([{ name: 'Alice', income: 70000 }]);

      result.autofill!();
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Alice', 70000, undefined);
    });

    it('should handle roommate rename by removing old and adding new', async () => {
      const mockApiResponse = {
        content: 'Renamed Alice to Alicia',
        parsedData: {
          roommates: [
            { name: 'Alicia', income: 60000, roomSize: 150 },
          ],
          removeRoommates: ['Alice'],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Rename Alice to Alicia',
        [],
        {
          ...mockCallbacks,
          onRemoveRoommate: jest.fn(),
        },
        {
          roommates: [
            { name: 'Alice', income: 60000, roomSize: 150 },
          ],
        }
      );

      expect(result.autofill).toBeDefined();
      
      // Execute autofill
      const extendedCallbacks = {
        ...mockCallbacks,
        onRemoveRoommate: jest.fn(),
      };
      
      await processChatbotMessage(
        'Rename Alice to Alicia',
        [],
        extendedCallbacks,
        {
          roommates: [
            { name: 'Alice', income: 60000, roomSize: 150 },
          ],
        }
      ).then(res => res.autofill!());

      expect(extendedCallbacks.onRemoveRoommate).toHaveBeenCalledWith('Alice');
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Alicia', 60000, 150);
    });

    it('should handle expense rename by removing old and adding new', async () => {
      const mockApiResponse = {
        content: 'Renamed Internet to WiFi',
        parsedData: {
          customExpenses: [
            { name: 'WiFi', amount: 75 },
          ],
          removeCustomExpenses: ['Internet'],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Rename Internet to WiFi',
        [],
        {
          ...mockCallbacks,
          onRemoveCustomExpense: jest.fn(),
        },
        {
          customExpenses: [
            { name: 'Internet', amount: 75 },
          ],
        }
      );

      expect(result.autofill).toBeDefined();
      
      // Execute autofill
      const extendedCallbacks = {
        ...mockCallbacks,
        onRemoveCustomExpense: jest.fn(),
      };
      
      await processChatbotMessage(
        'Rename Internet to WiFi',
        [],
        extendedCallbacks,
        {
          customExpenses: [
            { name: 'Internet', amount: 75 },
          ],
        }
      ).then(res => res.autofill!());

      expect(extendedCallbacks.onRemoveCustomExpense).toHaveBeenCalledWith('Internet');
      expect(mockCallbacks.onAddCustomExpense).toHaveBeenCalledWith('WiFi', 75);
    });

    it('should auto-detect split method based on roommate data (room size)', async () => {
      const mockApiResponse = {
        content: 'Added roommate with room size',
        parsedData: {
          roommates: [
            { name: 'Alice', roomSize: 150 },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Alice has a 150 sq ft room',
        [],
        mockCallbacks
      );

      expect(result.autofill).toBeDefined();
      result.autofill!();

      // Should auto-set to room size split
      expect(mockCallbacks.onSetSplitMethod).toHaveBeenCalledWith(true);
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Alice', 0, 150);
    });

    it('should auto-detect split method based on roommate data (income)', async () => {
      const mockApiResponse = {
        content: 'Added roommate with income',
        parsedData: {
          roommates: [
            { name: 'Bob', income: 60000 },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Bob makes $60k',
        [],
        mockCallbacks
      );

      expect(result.autofill).toBeDefined();
      result.autofill!();

      // Should auto-set to income split
      expect(mockCallbacks.onSetSplitMethod).toHaveBeenCalledWith(false);
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Bob', 60000, undefined);
    });

    it('should prioritize explicit split method over auto-detection', async () => {
      const mockApiResponse = {
        content: 'Added roommate and set split method',
        parsedData: {
          roommates: [
            { name: 'Alice', roomSize: 150 },
          ],
          useRoomSizeSplit: false, // Explicitly set to false
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'Switch to income split and add Alice with 150 sq ft room',
        [],
        mockCallbacks
      );

      expect(result.autofill).toBeDefined();
      result.autofill!();

      // Should use explicit value, not auto-detect
      expect(mockCallbacks.onSetSplitMethod).toHaveBeenCalledWith(false);
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('Alice', 0, 150);
    });

    it('should handle renaming from placeholder name "your name" to actual name', async () => {
      const mockApiResponse = {
        content: 'I\'ve updated your name to Matthew',
        parsedData: {
          roommates: [
            { name: 'matthew', income: 60000 },
          ],
          removeRoommates: ['your name'],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const extendedCallbacks = {
        ...mockCallbacks,
        onRemoveRoommate: jest.fn(),
      };

      const result = await processChatbotMessage(
        'my name is matthew',
        [],
        extendedCallbacks,
        {
          roommates: [
            { name: 'your name', income: 60000 },
          ],
        }
      );

      expect(result.autofill).toBeDefined();
      result.autofill!();

      // Should remove placeholder and add actual name
      expect(extendedCallbacks.onRemoveRoommate).toHaveBeenCalledWith('your name');
      expect(mockCallbacks.onAddRoommate).toHaveBeenCalledWith('matthew', 60000, undefined);
    });

    it('should ask for name if user provides income without name', async () => {
      const mockApiResponse = {
        content: 'What\'s your name? I need to know who this income belongs to.',
        parsedData: {},
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processChatbotMessage(
        'my income is $60k',
        [], // No conversation history with name
        mockCallbacks
      );

      // Should not have autofill - needs name first
      expect(result.autofill).toBeUndefined();
      expect(result.content).toContain('name');
      expect(mockCallbacks.onAddRoommate).not.toHaveBeenCalled();
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
      expect(isConfirmation('update the fields')).toBe(true);
      expect(isConfirmation('apply changes')).toBe(true);
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

