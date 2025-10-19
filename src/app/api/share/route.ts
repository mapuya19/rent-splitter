import { NextRequest, NextResponse } from 'next/server';
import { CalculationData } from '@/types';

// In-memory storage for demo purposes
// In production, you'd want to use a database like PostgreSQL, MongoDB, or Redis
const shareData = new Map<string, { data: CalculationData; createdAt: string }>();

// Data validation schemas
const validateCalculationData = (data: unknown): data is CalculationData => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  // Validate totalRent
  if (typeof obj.totalRent !== 'number' || obj.totalRent < 0) return false;
  
  // Validate utilities
  if (typeof obj.utilities !== 'number' || obj.utilities < 0) return false;
  
  // Validate customExpenses
  if (!Array.isArray(obj.customExpenses)) return false;
  for (const expense of obj.customExpenses) {
    if (typeof expense !== 'object' || !expense) return false;
    const expenseObj = expense as Record<string, unknown>;
    if (!expenseObj.id || typeof expenseObj.name !== 'string' || typeof expenseObj.amount !== 'number' || expenseObj.amount < 0) {
      return false;
    }
  }
  
  // Validate roommates
  if (!Array.isArray(obj.roommates) || obj.roommates.length === 0) return false;
  for (const roommate of obj.roommates) {
    if (typeof roommate !== 'object' || !roommate) return false;
    const roommateObj = roommate as Record<string, unknown>;
    if (!roommateObj.id || typeof roommateObj.name !== 'string' || typeof roommateObj.income !== 'number' || roommateObj.income < 0) {
      return false;
    }
    if (roommateObj.roomSize !== undefined && (typeof roommateObj.roomSize !== 'number' || roommateObj.roomSize < 0)) {
      return false;
    }
  }
  
  return true;
};

const validateId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9]+$/.test(id);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data } = body;
    
    // Validate request body
    if (!id || !data) {
      return NextResponse.json({ 
        error: 'Missing required fields: id and data',
        code: 'MISSING_FIELDS' 
      }, { status: 400 });
    }
    
    // Validate ID format
    if (!validateId(id)) {
      return NextResponse.json({ 
        error: 'Invalid ID format. Must contain only alphanumeric characters',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }
    
    // Validate data structure
    if (!validateCalculationData(data)) {
      return NextResponse.json({ 
        error: 'Invalid data structure. Please check all fields are valid.',
        code: 'INVALID_DATA' 
      }, { status: 400 });
    }
    
    // Check if ID already exists
    if (shareData.has(id)) {
      return NextResponse.json({ 
        error: 'ID already exists. Please generate a new shareable link.',
        code: 'ID_EXISTS' 
      }, { status: 409 });
    }
    
    // Store the data with the given ID
    shareData.set(id, {
      data,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ 
      success: true, 
      id,
      createdAt: shareData.get(id)?.createdAt 
    });
  } catch (error) {
    console.error('Error storing share data:', error);
    return NextResponse.json({ 
      error: 'Failed to store data',
      code: 'STORAGE_ERROR' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Missing id parameter',
        code: 'MISSING_ID' 
      }, { status: 400 });
    }
    
    // Validate ID format
    if (!validateId(id)) {
      return NextResponse.json({ 
        error: 'Invalid ID format',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }
    
    const storedData = shareData.get(id);
    
    if (!storedData) {
      return NextResponse.json({ 
        error: 'Share data not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      data: storedData.data,
      createdAt: storedData.createdAt 
    });
  } catch (error) {
    console.error('Error retrieving share data:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve data',
      code: 'RETRIEVAL_ERROR' 
    }, { status: 500 });
  }
}
