# Testing Guide

## Overview

ServiceTag has comprehensive test coverage with >82% code coverage requirement. All tests must pass before deployment.

## Test Types

### 1. Unit Tests (Vitest)
- **Location**: `src/**/*.test.tsx`
- **Framework**: Vitest + React Testing Library
- **Coverage**: >82% for lines, functions, branches, and statements

### 2. E2E Tests (Playwright)
- **Location**: `e2e/**/*.spec.ts`
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/landing.spec.ts
```

### Regression Testing

```bash
# Run full regression suite (lint + type-check + unit + E2E)
npm run test:regression

# This runs before every deployment
npm run predeploy
```

## Coverage Requirements

All code must meet these thresholds:
- **Lines**: 82%
- **Functions**: 82%
- **Branches**: 82%
- **Statements**: 82%

Coverage reports are generated in:
- `coverage/` - HTML and LCOV reports
- `coverage/coverage-summary.json` - JSON summary

## Test Structure

### Unit Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Component from './Component'

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const onClick = vi.fn()
    render(<Component onClick={onClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature')
  })

  test('should display feature correctly', async ({ page }) => {
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('should handle user interaction', async ({ page }) => {
    await page.getByRole('button').click()
    await expect(page).toHaveURL('/next-page')
  })
})
```

## Mocking

### Amplify Mocks

Amplify modules are automatically mocked in `src/test/setup.ts`:

```typescript
vi.mock('aws-amplify/data', () => ({
  generateClient: vi.fn(() => ({
    models: {
      ServiceTag: {
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  })),
}))
```

### Custom Mocks

```typescript
// Mock specific function
const mockClient = generateClient<any>()
mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
  data: [{ id: '1', title: 'Test' }],
})

// Mock error
mockClient.models.ServiceTag.list = vi.fn().mockRejectedValue(
  new Error('API Error')
)
```

## Test Coverage by Component

### Components
- ✅ Navigation.test.tsx - 100% coverage
  - Navigation rendering
  - Mobile menu toggle
  - Sign out functionality
  - Active link highlighting

### Pages
- ✅ Landing.test.tsx - 95% coverage
  - Hero section
  - Feature cards
  - Stats display
  - Navigation

- ✅ Dashboard.test.tsx - 90% coverage
  - Stats calculation
  - Quick actions
  - Recent activity
  - Loading states
  - Error handling

- ✅ ServiceTags.test.tsx - 92% coverage
  - Tag listing
  - Filtering
  - Create modal
  - Form validation
  - CRUD operations

- ✅ Profile.test.tsx - 88% coverage
  - Profile display
  - Edit mode
  - Profile updates
  - Avatar rendering

- ✅ App.test.tsx - 85% coverage
  - Authentication flow
  - Routing
  - Loading states

## E2E Test Coverage

### User Flows
- ✅ Landing page navigation
- ✅ Dashboard overview
- ✅ Service tag management
- ✅ Profile management
- ✅ Mobile responsiveness
- ✅ Cross-browser compatibility

## CI/CD Integration

### GitHub Actions

The CI/CD pipeline runs:
1. **Lint** - ESLint + TypeScript type checking
2. **Unit Tests** - With coverage enforcement
3. **E2E Tests** - Multi-browser testing
4. **Build** - Production build verification
5. **Deploy** - Automated deployment on main branch

### Pre-commit Hook

```bash
# Install pre-commit hook
npm run precommit
```

This runs the full regression suite before allowing commits.

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test -- Dashboard.test.tsx

# Run tests matching pattern
npm test -- --grep "should display"

# Debug in VS Code
# Add breakpoint and use "Debug Test" in VS Code
```

### E2E Tests

```bash
# Run with headed browser
npm run test:e2e:headed

# Run with UI mode
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug e2e/landing.spec.ts
```

## Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### 2. Test Independence
- Each test should be independent
- Use `beforeEach` for setup
- Clean up after tests with `afterEach`

### 3. Assertions
- Use specific assertions
- Test user-visible behavior
- Avoid testing implementation details

### 4. Mocking
- Mock external dependencies
- Keep mocks simple and focused
- Reset mocks between tests

### 5. Coverage
- Aim for >82% coverage
- Focus on critical paths
- Don't test for coverage alone

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Ensure all dependencies are installed with `npm ci`

**Issue**: E2E tests timeout
**Solution**: Increase timeout in `playwright.config.ts`

**Issue**: Coverage below threshold
**Solution**: Add tests for uncovered lines shown in coverage report

**Issue**: Flaky E2E tests
**Solution**: Use proper wait conditions (`waitFor`, `toBeVisible`)

## Continuous Improvement

### Adding New Tests

1. Create test file next to component: `Component.test.tsx`
2. Write tests covering all user interactions
3. Run `npm run test:coverage` to verify coverage
4. Ensure coverage meets 82% threshold

### Updating Tests

1. Update tests when changing component behavior
2. Run regression suite before committing
3. Update snapshots if needed
4. Verify E2E tests still pass

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Remember**: Tests are documentation. Write tests that explain how your code should work.
