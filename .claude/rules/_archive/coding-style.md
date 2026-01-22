# Coding Style Rules

Consistent code style improves readability, maintainability, and reduces bugs.

---

## 1. Immutability by Default

**Rule**: Prefer `const` over `let`. Never use `var`.

### Why:
- Prevents accidental reassignment
- Makes code easier to reason about
- Signals intent clearly

```typescript
// ✅ CORRECT
const user = { name: 'Alice' };
const users = [user];

// ❌ WRONG
var user = { name: 'Alice' };
let users = [user]; // when not reassigned
```

### When to Use `let`:
- Counters in loops
- Values that genuinely need reassignment
- Accumulator variables

---

## 2. File Size Limits

**Rule**: Keep files under 300 lines. If longer, split into smaller modules.

### Why:
- Easier to understand and review
- Encourages modular design
- Reduces merge conflicts
- Improves testability

### How to Split:
```
// Before: UserManager.ts (500 lines)
UserManager.ts

// After: Split into focused modules
UserManager.ts (100 lines)
UserValidator.ts (80 lines)
UserRepository.ts (120 lines)
UserNotifications.ts (90 lines)
```

### Exceptions:
- Configuration files
- Type definition files
- Generated code

---

## 3. Function Length

**Rule**: Keep functions under 50 lines. Ideally under 20 lines.

### Why:
- Single Responsibility Principle
- Easier to test
- Easier to understand
- Better code reuse

```typescript
// ✅ CORRECT: Small, focused functions
function validateUser(user: User): ValidationResult {
  const emailValid = validateEmail(user.email);
  const passwordValid = validatePassword(user.password);
  return { emailValid, passwordValid };
}

// ❌ WRONG: 100-line function doing everything
function processUser(user: User) {
  // validation logic (20 lines)
  // database logic (30 lines)
  // email sending logic (25 lines)
  // logging logic (15 lines)
  // error handling (10 lines)
}
```

---

## 4. Naming Conventions

**Rule**: Use clear, descriptive names. Avoid abbreviations.

### Variables & Functions:
```typescript
// ✅ CORRECT: Descriptive names
const userEmailAddress = 'user@example.com';
function calculateTotalPrice(items: Item[]): number { }

// ❌ WRONG: Unclear abbreviations
const usrEml = 'user@example.com';
function calcTot(itms: any[]): number { }
```

### Classes & Types:
```typescript
// ✅ CORRECT: PascalCase for types
class UserAuthentication { }
interface PaymentProcessor { }
type OrderStatus = 'pending' | 'completed';

// ❌ WRONG: Inconsistent casing
class userAuthentication { }
interface payment_processor { }
```

### Constants:
```typescript
// ✅ CORRECT: UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ WRONG: Not clear it's a constant
const maxRetryAttempts = 3;
```

### Booleans:
```typescript
// ✅ CORRECT: is/has/should prefix
const isAuthenticated = true;
const hasPermission = user.roles.includes('admin');
const shouldRetry = attempts < MAX_RETRY_ATTEMPTS;

// ❌ WRONG: Unclear meaning
const authenticated = true;
const permission = user.roles.includes('admin');
```

---

## 5. Early Returns

**Rule**: Use early returns to reduce nesting and improve readability.

```typescript
// ✅ CORRECT: Early returns, flat structure
function processOrder(order: Order): Result {
  if (!order) return { error: 'Order not found' };
  if (!order.items.length) return { error: 'Empty order' };
  if (order.total < 0) return { error: 'Invalid total' };

  return processPayment(order);
}

// ❌ WRONG: Deep nesting
function processOrder(order: Order): Result {
  if (order) {
    if (order.items.length > 0) {
      if (order.total >= 0) {
        return processPayment(order);
      } else {
        return { error: 'Invalid total' };
      }
    } else {
      return { error: 'Empty order' };
    }
  } else {
    return { error: 'Order not found' };
  }
}
```

---

## 6. Avoid Deep Nesting

**Rule**: Maximum 3 levels of nesting. Extract to functions if deeper.

```typescript
// ✅ CORRECT: Extracted to functions
function processUsers(users: User[]) {
  users.forEach(user => {
    if (isActiveUser(user)) {
      processActiveUser(user);
    }
  });
}

function processActiveUser(user: User) {
  if (hasCompletedProfile(user)) {
    sendWelcomeEmail(user);
  }
}

// ❌ WRONG: Too deeply nested
function processUsers(users: User[]) {
  users.forEach(user => {
    if (user.isActive) {
      if (user.profile) {
        if (user.profile.complete) {
          if (user.email) {
            sendEmail(user.email);
          }
        }
      }
    }
  });
}
```

---

## 7. One Concept Per File

**Rule**: Each file should have a single, clear purpose.

### File Organization:
```
// ✅ CORRECT: Clear separation
components/
  Button.tsx          // Button component only
  Input.tsx           // Input component only
  Form.tsx            // Form component only

// ❌ WRONG: Mixed concerns
components/
  UIComponents.tsx    // Contains Button, Input, Form, Modal, etc.
```

---

## 8. Import Organization

**Rule**: Group and sort imports logically.

```typescript
// ✅ CORRECT: Organized imports
// 1. External dependencies
import React from 'react';
import { format } from 'date-fns';

// 2. Internal modules
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Types
import type { User } from '@/types';

// 4. Styles (if any)
import styles from './Component.module.css';

// ❌ WRONG: Random order
import styles from './Component.module.css';
import type { User } from '@/types';
import React from 'react';
import { Button } from '@/components/Button';
```

---

## 9. Avoid Magic Numbers

**Rule**: Replace magic numbers with named constants.

```typescript
// ✅ CORRECT: Named constants
const SECONDS_IN_HOUR = 3600;
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_TIMEOUT_MS = 30000;

function calculateExpiry(hours: number): number {
  return Date.now() + (hours * SECONDS_IN_HOUR * 1000);
}

// ❌ WRONG: Magic numbers
function calculateExpiry(hours: number): number {
  return Date.now() + (hours * 3600 * 1000);
}
```

---

## 10. Comments

**Rule**: Write self-documenting code. Use comments for "why", not "what".

```typescript
// ✅ CORRECT: Explains why
// Using exponential backoff to avoid overwhelming the API
// after a temporary outage
const delay = Math.pow(2, attempt) * 1000;

// ✅ CORRECT: Self-documenting
function calculateUserAge(birthDate: Date): number {
  const today = new Date();
  return today.getFullYear() - birthDate.getFullYear();
}

// ❌ WRONG: States the obvious
// Increment counter
counter++;

// ❌ WRONG: Should refactor instead
// This function calculates the thing
function calc(a, b, c) { // What thing? What are a, b, c?
  return (a + b) * c;
}
```

### When to Add Comments:
- Complex algorithms
- Business logic requirements
- Performance optimizations
- Workarounds for bugs in dependencies
- TODO items (with ticket references)

---

## 11. Error Handling

**Rule**: Don't catch errors if you can't handle them meaningfully.

```typescript
// ✅ CORRECT: Handle or propagate
async function fetchUser(id: string): Promise<User> {
  try {
    return await api.getUser(id);
  } catch (error) {
    if (error.status === 404) {
      throw new UserNotFoundError(id);
    }
    throw error; // Re-throw if can't handle
  }
}

// ❌ WRONG: Silent failure
async function fetchUser(id: string): Promise<User | null> {
  try {
    return await api.getUser(id);
  } catch (error) {
    return null; // Lost error information
  }
}
```

---

## 12. Type Safety

**Rule**: Avoid `any`. Use proper types.

```typescript
// ✅ CORRECT: Proper typing
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ WRONG: any everywhere
function getUser(id: any): any {
  // Lost all type safety
}
```

### When `any` is Acceptable:
- Migrating legacy code (use `// @ts-expect-error` with explanation)
- Truly dynamic data (consider `unknown` instead)
- Third-party libraries without types (create declaration file)

---

## Style Checklist

- [ ] Using `const` by default
- [ ] Files under 300 lines
- [ ] Functions under 50 lines
- [ ] Clear, descriptive names
- [ ] Early returns to reduce nesting
- [ ] Maximum 3 levels of nesting
- [ ] One concept per file
- [ ] Organized imports
- [ ] Named constants instead of magic numbers
- [ ] Comments explain "why", not "what"
- [ ] Meaningful error handling
- [ ] Proper types, avoiding `any`

---

## Enforcement

**Automatic**: Use ESLint, Prettier, and TypeScript strict mode
**Manual**: Code reviews should check for style violations
**Regular**: Refactor files that violate these rules

---

## Resources

- Clean Code by Robert C. Martin
- TypeScript Best Practices: https://typescript-eslint.io/
- Airbnb JavaScript Style Guide: https://github.com/airbnb/javascript
