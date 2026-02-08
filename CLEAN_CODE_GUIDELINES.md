# Clean Code Guidelines - ServiceTag

## Overview

This document outlines the clean code principles, documentation standards, and best practices for the ServiceTag codebase. All code must follow these guidelines to ensure long-term maintainability.

## Table of Contents

1. [Code Documentation](#code-documentation)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Best Practices](#typescript-best-practices)
4. [Component Structure](#component-structure)
5. [Function Guidelines](#function-guidelines)
6. [Error Handling](#error-handling)
7. [Testing Standards](#testing-standards)
8. [File Organization](#file-organization)

---

## Code Documentation

### JSDoc Comments

**All files must include:**

```typescript
/**
 * @fileoverview Brief description of the file's purpose
 * @description Detailed explanation of what this file does
 * 
 * @requires List of major dependencies
 */
```

**All components must include:**

```typescript
/**
 * Component Name
 * @component
 * @description What this component does, its features, and use cases
 * 
 * @param {Props} props - Component props (if applicable)
 * @returns {JSX.Element} What the component renders
 * 
 * @example
 * <ComponentName prop1="value" />
 */
```

**All functions must include:**

```typescript
/**
 * Function description
 * @function functionName
 * @description Detailed explanation of what the function does
 * 
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} What the function returns
 * 
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * const result = functionName(param)
 */
```

**All interfaces/types must include:**

```typescript
/**
 * Interface description
 * @interface InterfaceName
 * @description What this interface represents
 * 
 * @property {Type} propertyName - Property description
 */
```

### Inline Comments

**Use inline comments for:**
- Complex logic that isn't immediately obvious
- Business rules and requirements
- Workarounds or temporary solutions
- Performance optimizations

**Format:**
```typescript
// Single-line comment for simple explanations

/**
 * Multi-line comment for complex explanations
 * that require more detail
 */
```

**Don't comment:**
- Obvious code (e.g., `// Set x to 5` for `x = 5`)
- What the code does (code should be self-documenting)
- Instead, explain WHY the code exists

---

## Naming Conventions

### General Rules

1. **Be Descriptive**: Names should clearly indicate purpose
2. **Be Consistent**: Follow established patterns
3. **Avoid Abbreviations**: Unless universally understood (e.g., `id`, `url`)
4. **Use Pronounceable Names**: Code is read more than written

### Specific Conventions

**Components** (PascalCase):
```typescript
// ✅ Good
export default function ServiceTagCard() {}
export default function UserProfileHeader() {}

// ❌ Bad
export default function stcard() {}
export default function usrprofhdr() {}
```

**Functions** (camelCase):
```typescript
// ✅ Good
function calculateTotalTags() {}
function handleUserSignOut() {}

// ❌ Bad
function calc() {}
function handle() {}
```

**Variables** (camelCase):
```typescript
// ✅ Good
const isAuthenticated = true
const userProfileData = {}

// ❌ Bad
const auth = true
const data = {}
```

**Constants** (UPPER_SNAKE_CASE):
```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.example.com'

// ❌ Bad
const maxRetry = 3
const apiUrl = 'https://api.example.com'
```

**Interfaces/Types** (PascalCase):
```typescript
// ✅ Good
interface UserProfile {}
type ServiceTagStatus = 'active' | 'pending'

// ❌ Bad
interface profile {}
type status = string
```

**Files** (kebab-case or PascalCase):
```typescript
// ✅ Good
service-tags.tsx
ServiceTags.tsx
user-profile.test.tsx

// ❌ Bad
servicetags.tsx
service_tags.tsx
```

---

## TypeScript Best Practices

### Type Annotations

**Always provide explicit types for:**
- Function parameters
- Function return values
- Component props
- State variables (when not obvious)

```typescript
// ✅ Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ Bad
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### Avoid `any`

```typescript
// ✅ Good
interface ApiResponse {
  data: ServiceTag[]
  error: string | null
}

// ❌ Bad
let response: any
```

### Use Union Types

```typescript
// ✅ Good
type Status = 'active' | 'pending' | 'completed' | 'archived'

// ❌ Bad
type Status = string
```

### Prefer Interfaces for Objects

```typescript
// ✅ Good
interface UserProfile {
  id: string
  name: string
  email: string
}

// ❌ Bad (for object shapes)
type UserProfile = {
  id: string
  name: string
  email: string
}
```

---

## Component Structure

### Standard Component Template

```typescript
/**
 * @fileoverview Component description
 */

import { useState, useEffect } from 'react'
// ... other imports

/**
 * Props interface
 */
interface ComponentProps {
  prop1: string
  prop2?: number // Optional props marked with ?
}

/**
 * Component description
 * @component
 */
export default function Component({ prop1, prop2 = 0 }: ComponentProps) {
  // 1. State declarations
  const [state, setState] = useState<Type>(initialValue)

  // 2. Hooks (useEffect, useContext, etc.)
  useEffect(() => {
    // Effect logic
  }, [dependencies])

  // 3. Event handlers
  const handleEvent = (): void => {
    // Handler logic
  }

  // 4. Helper functions
  const helperFunction = (): ReturnType => {
    // Helper logic
  }

  // 5. Conditional rendering checks
  if (loading) {
    return <LoadingState />
  }

  // 6. Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### Component Organization

1. **Imports** - Grouped and ordered:
   - React imports
   - Third-party libraries
   - Local components
   - Utilities/helpers
   - Styles

2. **Types/Interfaces** - Before component

3. **Constants** - Before component

4. **Component** - Main export

5. **Sub-components** - After main component (if small)

---

## Function Guidelines

### Single Responsibility

Each function should do ONE thing well.

```typescript
// ✅ Good - Single responsibility
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // Send email logic
}

// ❌ Bad - Multiple responsibilities
function validateAndSendEmail(email: string, subject: string, body: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // Send email logic
  }
}
```

### Function Length

- **Ideal**: 10-20 lines
- **Maximum**: 50 lines
- If longer, break into smaller functions

### Pure Functions

Prefer pure functions (no side effects):

```typescript
// ✅ Good - Pure function
function calculateDiscount(price: number, percentage: number): number {
  return price * (percentage / 100)
}

// ❌ Bad - Side effects
let total = 0
function addToTotal(amount: number): void {
  total += amount // Modifies external state
}
```

### Early Returns

Use early returns to reduce nesting:

```typescript
// ✅ Good
function processUser(user: User | null): string {
  if (!user) return 'No user'
  if (!user.isActive) return 'Inactive user'
  if (!user.email) return 'No email'
  
  return `Welcome ${user.name}`
}

// ❌ Bad
function processUser(user: User | null): string {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        return `Welcome ${user.name}`
      }
    }
  }
  return 'Error'
}
```

---

## Error Handling

### Try-Catch Blocks

Always handle errors appropriately:

```typescript
/**
 * Load user data from API
 * @async
 */
async function loadUserData(): Promise<void> {
  try {
    const response = await api.getUser()
    setUser(response.data)
  } catch (error) {
    // Log error for debugging
    console.error('Failed to load user data:', error)
    
    // Show user-friendly message
    setError('Unable to load your profile. Please try again.')
    
    // Optional: Report to error tracking service
    // reportError(error)
  } finally {
    // Always runs - cleanup code
    setLoading(false)
  }
}
```

### Error Messages

- **User-facing**: Clear, actionable, non-technical
- **Console logs**: Detailed, include context
- **Never expose**: Sensitive data, stack traces to users

```typescript
// ✅ Good
catch (error) {
  console.error('API Error:', error)
  setError('Unable to save changes. Please try again.')
}

// ❌ Bad
catch (error) {
  setError(error.message) // May expose technical details
}
```

---

## Testing Standards

### Test File Naming

```
ComponentName.test.tsx
functionName.test.ts
```

### Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset mocks, clear state
  })

  // Group related tests
  describe('when user is authenticated', () => {
    it('should display user profile', () => {
      // Arrange
      const user = { name: 'Test User' }
      
      // Act
      render(<Component user={user} />)
      
      // Assert
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })
})
```

### Test Naming

Use descriptive test names:

```typescript
// ✅ Good
it('should display error message when API call fails')
it('should navigate to dashboard after successful login')

// ❌ Bad
it('works')
it('test1')
```

---

## File Organization

### Directory Structure

```
src/
├── components/          # Reusable components
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.css
│   │   ├── ComponentName.test.tsx
│   │   └── index.ts     # Re-export
│   └── ...
├── pages/              # Page components
│   ├── PageName/
│   │   ├── PageName.tsx
│   │   ├── PageName.css
│   │   └── PageName.test.tsx
│   └── ...
├── utils/              # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── ...
├── types/              # TypeScript types/interfaces
│   ├── user.ts
│   └── ...
└── test/               # Test utilities
    └── setup.ts
```

### Import Organization

```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Third-party libraries
import { motion } from 'framer-motion'
import { generateClient } from 'aws-amplify/data'

// 3. Local components
import Navigation from '../components/Navigation'

// 4. Utilities
import { validateEmail } from '../utils/validation'

// 5. Types
import type { User } from '../types/user'

// 6. Styles
import './Component.css'
```

---

## Code Review Checklist

Before submitting code, verify:

- [ ] All functions have JSDoc comments
- [ ] All components have JSDoc comments
- [ ] All types/interfaces are documented
- [ ] Variable names are descriptive
- [ ] No `any` types (unless absolutely necessary)
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] No console.logs in production code
- [ ] Code follows DRY principle
- [ ] Functions are small and focused
- [ ] Comments explain WHY, not WHAT
- [ ] Accessibility attributes added (aria-labels, roles)
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no warnings

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

**Remember**: Code is read far more often than it is written. Write code for the next developer (which might be you in 6 months).
