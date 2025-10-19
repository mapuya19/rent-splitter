/**
 * Integration tests for the sharing workflow
 * Tests the complete flow from creating a shareable link to retrieving the data
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/share/route';

describe('Sharing Integration Tests', () => {
  const testCalculationData = {
    totalRent: 3000,
    utilities: 400,
    customExpenses: [
      { id: 'exp1', name: 'Internet', amount: 75 },
      { id: 'exp2', name: 'Parking', amount: 100 }
    ],
    roommates: [
      { id: 'roommate1', name: 'Alice', income: 70000, roomSize: 120 },
      { id: 'roommate2', name: 'Bob', income: 90000, roomSize: 180 },
      { id: 'roommate3', name: 'Charlie', income: 110000, roomSize: 200 }
    ]
  };

  it('should complete full sharing workflow', async () => {
    const shareId = 'integrationtest123';
    
    // Step 1: Store the data
    const storeRequest = new NextRequest('http://localhost:3000/api/share', {
      method: 'POST',
      body: JSON.stringify({
        id: shareId,
        data: testCalculationData
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const storeResponse = await POST(storeRequest);
    const storeResult = await storeResponse.json();

    expect(storeResponse.status).toBe(200);
    expect(storeResult.success).toBe(true);
    expect(storeResult.id).toBe(shareId);
    expect(storeResult.createdAt).toBeDefined();

    // Step 2: Retrieve the data
    const retrieveRequest = new NextRequest(`http://localhost:3000/api/share?id=${shareId}`);
    const retrieveResponse = await GET(retrieveRequest);
    const retrieveResult = await retrieveResponse.json();

    expect(retrieveResponse.status).toBe(200);
    expect(retrieveResult.data).toEqual(testCalculationData);
    expect(retrieveResult.createdAt).toBe(storeResult.createdAt);
  });

  it('should handle multiple shares with different IDs', async () => {
    const shareId1 = 'multitest1';
    const shareId2 = 'multitest2';
    
    const data1 = { ...testCalculationData, totalRent: 2000 };
    const data2 = { ...testCalculationData, totalRent: 4000 };

    // Store first share
    const request1 = new NextRequest('http://localhost:3000/api/share', {
      method: 'POST',
      body: JSON.stringify({ id: shareId1, data: data1 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response1 = await POST(request1);
    expect(response1.status).toBe(200);

    // Store second share
    const request2 = new NextRequest('http://localhost:3000/api/share', {
      method: 'POST',
      body: JSON.stringify({ id: shareId2, data: data2 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response2 = await POST(request2);
    expect(response2.status).toBe(200);

    // Retrieve both shares
    const retrieve1 = new NextRequest(`http://localhost:3000/api/share?id=${shareId1}`);
    const result1 = await GET(retrieve1);
    const data1Result = await result1.json();
    expect(data1Result.data.totalRent).toBe(2000);

    const retrieve2 = new NextRequest(`http://localhost:3000/api/share?id=${shareId2}`);
    const result2 = await GET(retrieve2);
    const data2Result = await result2.json();
    expect(data2Result.data.totalRent).toBe(4000);
  });

  it('should handle edge cases in sharing workflow', async () => {
    // Test with minimal valid data
    const minimalData = {
      totalRent: 1000,
      utilities: 0,
      customExpenses: [],
      roommates: [
        { id: 'single', name: 'Solo', income: 50000 }
      ]
    };

    const shareId = 'edgecasetest';
    const request = new NextRequest('http://localhost:3000/api/share', {
      method: 'POST',
      body: JSON.stringify({ id: shareId, data: minimalData }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify it can be retrieved
    const retrieveRequest = new NextRequest(`http://localhost:3000/api/share?id=${shareId}`);
    const retrieveResponse = await GET(retrieveRequest);
    const result = await retrieveResponse.json();
    
    expect(retrieveResponse.status).toBe(200);
    expect(result.data).toEqual(minimalData);
  });

  it('should handle concurrent sharing requests', async () => {
    const promises = [];
    const shareIds = [];

    // Create multiple concurrent requests
    for (let i = 0; i < 5; i++) {
      const shareId = `concurrenttest${i}`;
      shareIds.push(shareId);
      
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          id: shareId,
          data: { ...testCalculationData, totalRent: 1000 + i * 100 }
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      promises.push(POST(request));
    }

    // Wait for all requests to complete
    const responses = await Promise.all(promises);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Verify all data can be retrieved
    for (const shareId of shareIds) {
      const retrieveRequest = new NextRequest(`http://localhost:3000/api/share?id=${shareId}`);
      const retrieveResponse = await GET(retrieveRequest);
      expect(retrieveResponse.status).toBe(200);
    }
  });

  it('should handle malformed requests gracefully', async () => {
    // Test with completely invalid JSON
    const request = new NextRequest('http://localhost:3000/api/share', {
      method: 'POST',
      body: 'not json at all',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    
    const result = await response.json();
    expect(result.error).toBe('Failed to store data');
    expect(result.code).toBe('STORAGE_ERROR');
  });

  it('should handle retrieval of non-existent data', async () => {
    const request = new NextRequest('http://localhost:3000/api/share?id=definitelydoesnotexist');
    const response = await GET(request);
    
    expect(response.status).toBe(404);
    
    const result = await response.json();
    expect(result.error).toBe('Share data not found');
    expect(result.code).toBe('NOT_FOUND');
  });
});
