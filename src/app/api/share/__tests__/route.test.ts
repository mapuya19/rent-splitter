import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock data for testing
const validCalculationData = {
  totalRent: 2000,
  utilities: 300,
  customExpenses: [
    { id: 'exp1', name: 'Internet', amount: 50 },
    { id: 'exp2', name: 'Cable', amount: 80 }
  ],
  roommates: [
    { id: 'roommate1', name: 'Alice', income: 60000, roomSize: 120 },
    { id: 'roommate2', name: 'Bob', income: 80000, roomSize: 150 }
  ]
};

const invalidCalculationData = {
  totalRent: -100, // Invalid: negative rent
  utilities: 'invalid', // Invalid: not a number
  customExpenses: 'not an array', // Invalid: not an array
  roommates: [] // Invalid: empty array
};

describe('/api/share', () => {
  beforeEach(() => {
    // Clear the in-memory storage before each test
    // Note: In a real test environment, you'd want to clear the actual storage
    // For now, we'll rely on the test isolation
  });

  describe('POST /api/share', () => {
    it('should store valid calculation data successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'test123',
          data: validCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.id).toBe('test123');
      expect(result.createdAt).toBeDefined();
    });

    it('should reject request with missing id', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          data: validCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Missing required fields: id and data');
      expect(result.code).toBe('MISSING_FIELDS');
    });

    it('should reject request with missing data', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'test123'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Missing required fields: id and data');
      expect(result.code).toBe('MISSING_FIELDS');
    });

    it('should reject invalid ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'invalid-id-with-special-chars!',
          data: validCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid ID format. Must contain only alphanumeric characters');
      expect(result.code).toBe('INVALID_ID');
    });

    it('should reject invalid data structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'test123',
          data: invalidCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid data structure. Please check all fields are valid.');
      expect(result.code).toBe('INVALID_DATA');
    });

    it('should reject duplicate ID', async () => {
      // First request
      const request1 = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'duplicate123',
          data: validCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request1);

      // Second request with same ID
      const request2 = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'duplicate123',
          data: validCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request2);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.error).toBe('ID already exists. Please generate a new shareable link.');
      expect(result.code).toBe('ID_EXISTS');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to store data');
      expect(result.code).toBe('STORAGE_ERROR');
    });
  });

  describe('GET /api/share', () => {
    beforeEach(async () => {
      // Store test data
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'retrieve123',
          data: validCalculationData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await POST(request);
    });

    it('should retrieve stored data successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/share?id=retrieve123');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toEqual(validCalculationData);
      expect(result.createdAt).toBeDefined();
    });

    it('should return 404 for non-existent ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/share?id=nonexistent');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('Share data not found');
      expect(result.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing ID parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/share');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Missing id parameter');
      expect(result.code).toBe('MISSING_ID');
    });

    it('should return 400 for invalid ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/share?id=invalid-id!');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid ID format');
      expect(result.code).toBe('INVALID_ID');
    });
  });
});
