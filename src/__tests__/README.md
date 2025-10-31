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
- **Rent calculations**: Basic income-based splitting
- **Currency formatting**: Tests for proper currency display
- **Core functionality**: Verifies the testing setup works correctly

### 2. Utility Tests (`utils/__tests__/`)

#### `calculations.test.ts`
- **Rent calculations**: Tests for income-based and room-size-based splitting
- **Utilities splitting**: Tests for even distribution of utilities
- **Custom expenses**: Tests for custom expense handling
- **Edge cases**: Tests for zero values, single roommate, etc.
- **Data validation**: Ensures calculation results are correct

#### `adjustments.test.ts`
- **Private bathroom adjustment**: Tests 15% rent adjustment for private bathrooms
- **Window adjustments**: Tests rent reduction for rooms without windows
- **Flex wall adjustments**: Tests rent adjustments for flexible walls
- **Combined adjustments**: Tests multiple adjustments applied together
- **Adjustment calculations**: Verifies adjustment amounts are correct

#### `compression.test.ts`
- **Data compression**: Tests URL compression for shareable links
- **Data decompression**: Tests decompression of compressed data
- **Compression ratio**: Tests that compression reduces URL length
- **Edge cases**: Tests with empty data, missing fields, etc.
- **Data integrity**: Ensures compressed data matches original after decompression

#### `chatbot.test.ts`
- **Message processing**: Tests chatbot message processing with LLM API
- **Autofill functionality**: Tests automatic form filling from extracted data
- **Confirmation detection**: Tests recognition of user confirmations (yes, ok, etc.)
- **Error handling**: Tests graceful fallback to rules-based responses
- **Conversation history**: Tests proper handling of conversation context
- **Data extraction**: Tests extraction of rent, utilities, roommates, expenses from natural language
- **API integration**: Tests communication with Groq API
- **Edge cases**: Tests with missing data, network errors, API failures

### 3. Integration Tests (`integration/sharing.test.ts`)
- **Complete workflow**: Tests the full URL-based sharing process
- **Encoding/decoding**: Tests data compression and decompression
- **URL generation**: Tests shareable URL creation
- **Multiple scenarios**: Tests different calculation scenarios (income-based, room-size-based, different currencies)
- **URL length limits**: Tests handling of large datasets with compression
- **Error handling**: Tests graceful handling of invalid/corrupted data

### 4. Component Tests (`components/simple-sharing.test.tsx`)
- **Frontend sharing**: Tests the UI sharing functionality
- **Core logic**: Tests rent split calculations for sharing scenarios
- **Room size splitting**: Tests room-size-based splitting for sharing
- **Edge cases**: Tests single roommate scenarios

### 5. API Route Tests (`app/api/chat/__tests__/route.test.ts`)
- **Chat API endpoint**: Tests the `/api/chat` POST endpoint
- **LLM integration**: Tests communication with Groq API (Llama 3.1 model)
- **Data extraction**: Tests parsing of structured data from LLM responses
- **JSON parsing**: Tests extraction of JSON from LLM responses (including code blocks)
- **Error handling**: Tests API errors, network failures, and missing API keys
- **Conversation history**: Tests proper formatting and inclusion of conversation context
- **Response formatting**: Tests correct response structure and data parsing
- **Edge cases**: Tests with missing messages, invalid responses, complex data structures

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

- **Browser APIs**: Clipboard, location, and alert are mocked in component tests
- **Next.js router**: Navigation functions are mocked where needed
- **Fetch API**: Global fetch is mocked for chatbot API tests
- **External APIs**: Groq API calls are mocked with realistic responses
- **Next.js server components**: NextRequest and NextResponse are mocked for API route tests
- **URL-based sharing**: The application uses URL-based sharing (no database), but API mocking is used for chatbot functionality

## Testing Approach

### URL-Based Sharing
The application uses URL-based sharing with compressed data:
- All calculation data is encoded in URL parameters
- No database required for sharing
- Data is compressed using Base64 encoding and custom compression strategies
- Tests verify compression reduces URL length while maintaining data integrity

### Chatbot Testing
The chatbot feature is thoroughly tested:
- **API integration**: Tests mock the Groq API to verify proper request formatting
- **Data extraction**: Tests verify structured data is correctly extracted from natural language
- **Autofill functionality**: Tests verify extracted data correctly populates forms
- **Fallback behavior**: Tests verify rules-based fallback when API is unavailable
- **Error scenarios**: Tests cover network errors, API failures, and invalid responses
- **Conversation flow**: Tests verify proper handling of multi-turn conversations

### Test Isolation
- Each test is independent and doesn't affect others
- Tests use isolated data structures
- No shared state between tests

### Error Coverage
- Tests cover both success and failure scenarios
- Invalid data handling is tested
- Edge cases (empty data, single roommate, zero values) are covered

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Realistic data**: Tests use data that reflects real usage patterns
3. **Error coverage**: Tests cover both success and failure scenarios
4. **Performance**: Tests run quickly and don't require external services
5. **Maintainability**: Tests are well-documented and easy to understand
6. **Coverage**: Aim for high coverage of critical business logic (calculations, compression)

## Notes

- **URL-based sharing**: The application does not use API endpoints for sharing - all sharing is URL-based
- **No database**: No database is required for sharing - all data is stored in URL parameters
- **Chatbot API**: The chatbot feature uses the `/api/chat` endpoint which communicates with Groq API
- **Client-side logic**: Tests focus on client-side logic, URL-based sharing workflows, and chatbot functionality
- **Component tests**: Component tests verify UI functionality without requiring full rendering (where possible)
- **API mocking**: All external API calls (Groq) are mocked in tests for reliability and speed
