/**
 * Tests for data validation in the sharing API
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/share/route';

describe('Data Validation Tests', () => {
  const validBaseData = {
    totalRent: 2000,
    utilities: 300,
    customExpenses: [
      { id: 'exp1', name: 'Internet', amount: 50 }
    ],
    roommates: [
      { id: 'roommate1', name: 'Alice', income: 60000 }
    ]
  };

  describe('Rent validation', () => {
    it('should accept valid rent amounts', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testrentvalid',
          data: { ...validBaseData, totalRent: 1500 }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject negative rent', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testrentnegative',
          data: { ...validBaseData, totalRent: -100 }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.code).toBe('INVALID_DATA');
    });

    it('should reject non-numeric rent', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testrentnonnumeric',
          data: { ...validBaseData, totalRent: 'not a number' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Utilities validation', () => {
    it('should accept zero utilities', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testutilitieszero',
          data: { ...validBaseData, utilities: 0 }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject negative utilities', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testutilitiesnegative',
          data: { ...validBaseData, utilities: -50 }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Custom expenses validation', () => {
    it('should accept empty custom expenses', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testexpensesempty',
          data: { ...validBaseData, customExpenses: [] }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject non-array custom expenses', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testexpensesnonarray',
          data: { ...validBaseData, customExpenses: 'not an array' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject custom expenses with missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testexpensesmissingfields',
          data: {
            ...validBaseData,
            customExpenses: [{ name: 'Internet' }] // Missing id and amount
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject custom expenses with negative amounts', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testexpensesnegative',
          data: {
            ...validBaseData,
            customExpenses: [{ id: 'exp1', name: 'Internet', amount: -50 }]
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Roommates validation', () => {
    it('should reject empty roommates array', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testroommatesempty',
          data: { ...validBaseData, roommates: [] }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject non-array roommates', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testroommatesnonarray',
          data: { ...validBaseData, roommates: 'not an array' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject roommates with missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testroommatesmissingfields',
          data: {
            ...validBaseData,
            roommates: [{ name: 'Alice' }] // Missing id and income
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject roommates with negative income', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testroommatesnegativeincome',
          data: {
            ...validBaseData,
            roommates: [{ id: 'roommate1', name: 'Alice', income: -1000 }]
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept roommates with optional room size', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testroommateswithroomsize',
          data: {
            ...validBaseData,
            roommates: [
              { id: 'roommate1', name: 'Alice', income: 60000, roomSize: 120 }
            ]
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject roommates with negative room size', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'testroommatesnegativeroomsize',
          data: {
            ...validBaseData,
            roommates: [
              { id: 'roommate1', name: 'Alice', income: 60000, roomSize: -50 }
            ]
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('ID validation', () => {
    it('should accept alphanumeric IDs', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'test123ABC',
          data: validBaseData
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject IDs with special characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: 'test-id-with-special-chars!@#',
          data: validBaseData
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.code).toBe('INVALID_ID');
    });

    it('should reject empty ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: '',
          data: validBaseData
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
