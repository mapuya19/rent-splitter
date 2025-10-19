# Testing Documentation

This directory contains comprehensive tests for the Rent Splitter application.

## Test Structure

```
__tests__/
├── components/          # Component tests
│   └── sharing.test.tsx  # Frontend sharing functionality tests
├── integration/          # Integration tests
│   └── sharing.test.ts   # End-to-end sharing workflow tests
├── validation/          # Data validation tests
│   └── data-validation.test.ts  # API data validation tests
└── README.md            # This file
```

## Test Categories

### 1. API Tests (`/api/share/__tests__/route.test.ts`)
- **POST endpoint**: Tests for storing shareable data
- **GET endpoint**: Tests for retrieving shareable data
- **Error handling**: Tests for various error conditions
- **Data validation**: Tests for input validation

### 2. Utility Tests (`/utils/__tests__/calculations.test.ts`)
- **Rent calculations**: Tests for income-based and room-size-based splitting
- **Currency formatting**: Tests for proper currency display
- **Edge cases**: Tests for zero values, single roommate, etc.

### 3. Integration Tests (`/integration/sharing.test.ts`)
- **Complete workflow**: Tests the full sharing process
- **Concurrent requests**: Tests handling multiple simultaneous requests
- **Error scenarios**: Tests graceful handling of failures

### 4. Component Tests (`/components/sharing.test.tsx`)
- **Frontend sharing**: Tests the UI sharing functionality
- **API integration**: Tests frontend-backend communication
- **User interactions**: Tests user experience flows

### 5. Validation Tests (`/validation/data-validation.test.ts`)
- **Data integrity**: Tests for all data validation rules
- **Edge cases**: Tests for boundary conditions
- **Security**: Tests for malicious input handling

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

## Mocking Strategy

- **API calls**: Mocked using Jest's fetch mock
- **Browser APIs**: Clipboard, location, and alert are mocked
- **Next.js router**: Navigation functions are mocked
- **External dependencies**: All external services are mocked

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Realistic data**: Tests use data that reflects real usage patterns
3. **Error coverage**: Tests cover both success and failure scenarios
4. **Performance**: Tests run quickly and don't require external services
5. **Maintainability**: Tests are well-documented and easy to understand
