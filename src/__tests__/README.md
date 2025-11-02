# Testing Documentation

This directory contains comprehensive tests for the Rent Splitter application.

## Test Structure

```
__tests__/
├── components/                    # Component tests
│   └── simple-sharing.test.tsx   # Frontend sharing functionality tests
├── integration/                   # Integration tests
│   └── sharing.test.ts           # End-to-end URL-based sharing workflow tests
├── basic.test.ts                  # Basic functionality tests
└── README.md                      # This file

utils/__tests__/
├── calculations.test.ts           # Rent calculation logic tests
├── adjustments.test.ts            # Room adjustment calculation tests
├── chatbot.test.ts                # Chatbot utility function tests
└── compression.test.ts            # URL compression/decompression tests

app/api/chat/__tests__/
└── route.test.ts                  # Chat API route tests
```

## Test Categories

### 1. Basic Functionality Tests (`basic.test.ts`)
- Basic rent calculations, currency formatting, and core functionality verification

### 2. Utility Tests (`utils/__tests__/`)

#### `calculations.test.ts`
- Rent calculations (income-based and room-size-based), utilities splitting, custom expenses
- Edge cases and data validation

#### `adjustments.test.ts`
- Private bathroom, window, and flex wall adjustments
- Combined adjustments and calculation verification

#### `compression.test.ts`
- URL compression/decompression, compression ratio, data integrity
- Edge cases with empty/missing data

#### `chatbot.test.ts`
- Message processing, autofill functionality, and confirmation detection
- Data extraction from natural language (rent, utilities, roommates, expenses)
- Error handling, conversation history, and edge cases

### 3. Integration Tests (`integration/sharing.test.ts`)
- Complete URL-based sharing workflow, encoding/decoding, URL generation
- Multiple scenarios, URL length limits, and error handling

### 4. Component Tests (`components/simple-sharing.test.tsx`)
- Frontend sharing UI, rent split calculations, and edge cases

### 5. API Route Tests (`app/api/chat/__tests__/route.test.ts`)
- Chat API endpoint (`/api/chat` POST)
- LLM integration with Groq API, JSON parsing (including code blocks)
- Error handling, conversation history, and response formatting

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Coverage Requirements

The test suite enforces the following coverage thresholds:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Data

Tests use realistic data that mirrors real-world usage:
- Valid rent amounts ($1000-$5000)
- Realistic roommate incomes ($40,000-$150,000)
- Common utilities and expenses
- Various room sizes (100-300 sq ft)
- Multiple currencies (USD, EUR, GBP, etc.)

## Mocking Strategy

- Browser APIs (clipboard, location, alert) and Next.js router are mocked
- Fetch API and Groq API calls are mocked with realistic responses
- Next.js server components (NextRequest, NextResponse) are mocked for API route tests

## Testing Approach

### URL-Based Sharing
URL-based sharing with compressed data (Base64 + custom compression). Tests verify compression reduces URL length while maintaining data integrity.

### Chatbot Testing
Tests cover API integration, data extraction, autofill functionality, error handling, and multi-turn conversation flow.

### Test Isolation
- Each test is independent with isolated data structures and no shared state

### Error Coverage
- Both success and failure scenarios, including invalid data handling and edge cases (empty data, single roommate, zero values)

## Best Practices

1. **Isolation** - Independent tests with no shared state
2. **Realistic data** - Tests reflect real-world usage patterns
3. **Error coverage** - Success and failure scenarios tested
4. **Performance** - Fast tests without external service dependencies
5. **Maintainability** - Well-documented and understandable
6. **Coverage** - High coverage target for critical business logic (calculations, compression)

## Notes

- URL-based sharing: No database required, all data encoded in URL parameters
- Chatbot API: Uses `/api/chat` endpoint communicating with Groq API
- All external API calls are mocked in tests for reliability and speed
