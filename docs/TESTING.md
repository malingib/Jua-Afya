# Testing Guide

## Overview

This project includes a comprehensive testing setup with Jest and React Testing Library. This guide covers how to write and run tests.

## Setup

### Running Tests

```bash
# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run all tests once
npm run test

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside source files:

```
utils/validators.ts
__tests__/utils/validators.test.ts

hooks/useAsync.ts
__tests__/hooks/useAsync.test.ts
```

## Writing Tests

### Unit Tests (Functions & Utilities)

Test pure functions and utilities:

```typescript
// __tests__/utils/validators.test.ts
import { validateEmail } from '../../utils/validators';

describe('validators', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid emails', () => {
      const result = validateEmail('invalid.email');
      expect(result.valid).toBe(false);
    });
  });
});
```

### Hook Tests

Test custom React hooks with `renderHook`:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '../../hooks/useAsync';

describe('useAsync', () => {
  it('should execute function and return data', async () => {
    const mockFn = jest.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsync(mockFn, false));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toBe('data');
  });
});
```

### Component Tests

Test React components with `render`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../components/common/Button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Coverage Goals

Target 50%+ code coverage for:
- Utils and helpers
- Custom hooks
- Context providers

Current coverage targets are configured in `jest.config.js`.

## Common Testing Patterns

### Async Operations

```typescript
it('should handle async operations', async () => {
  const { result } = renderHook(() => useAsync(fetchData, true));
  
  await waitFor(() => {
    expect(result.current.status).toBe('success');
  });
});
```

### User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  render(<FormInput />);
  
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'test value');
  
  expect(input).toHaveValue('test value');
});
```

### Mocking

```typescript
// Mock a module
jest.mock('../../utils/supabase', () => ({
  supabaseAuth: {
    signIn: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  })
);
```

## Pre-commit Hooks

Tests and type checking run automatically before commits via Husky:

- **pre-commit**: Runs TypeScript type checking
- **pre-push**: Runs type checking + test coverage

To bypass (not recommended):
```bash
git commit --no-verify
git push --no-verify
```

## Best Practices

1. **Test behavior, not implementation** - Test what the component does, not how it does it
2. **Use descriptive test names** - `it('should validate email format')`
3. **One assertion per test** - Makes failures clear
4. **Test edge cases** - Empty inputs, errors, loading states
5. **Mock external dependencies** - Don't test third-party APIs
6. **Keep tests maintainable** - DRY principle applies to tests too

## Debugging Tests

### Debug individual tests

```bash
npm run test -- --testNamePattern="should validate email"
```

### Debug with logging

```typescript
screen.debug(); // Prints current DOM
console.log(result.current); // Print hook state
```

### Run in debug mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Adding More Tests

Priority areas for test coverage:

1. **Critical services** - Validators, error handler, auth
2. **Custom hooks** - State management hooks
3. **Context providers** - Patient, Inventory, Visit contexts
4. **Integration workflows** - Patient CRUD, Visit transitions

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
