# Testing Rules

Quality software requires comprehensive testing. These rules ensure reliable, maintainable test coverage.

---

## 1. Test-Driven Development (TDD)

**Rule**: Write tests before implementation for new features.

### TDD Cycle (Red-Green-Refactor):
1. **RED**: Write failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

```typescript
// Step 1: Write failing test (RED)
describe('calculateDiscount', () => {
  it('applies 10% discount for premium users', () => {
    const result = calculateDiscount(100, 'premium');
    expect(result).toBe(90);
  });
});

// Step 2: Implement (GREEN)
function calculateDiscount(price: number, tier: string): number {
  if (tier === 'premium') return price * 0.9;
  return price;
}

// Step 3: Refactor
function calculateDiscount(price: number, tier: UserTier): number {
  const discounts = { premium: 0.1, standard: 0 };
  return price * (1 - discounts[tier]);
}
```

---

## 2. Coverage Requirements

**Rule**: Maintain minimum 80% code coverage.

### What to Measure:
- **Line coverage**: % of lines executed
- **Branch coverage**: % of if/else branches tested
- **Function coverage**: % of functions called

```bash
# Run coverage
npm test -- --coverage

# Target thresholds
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Focus on Critical Paths:
- Business logic: 90%+ coverage
- API endpoints: 90%+ coverage
- Utility functions: 85%+ coverage
- UI components: 70%+ coverage (focus on logic)

---

## 3. Test Structure (AAA Pattern)

**Rule**: Use Arrange-Act-Assert pattern for clarity.

```typescript
// ✅ CORRECT: Clear AAA structure
test('adds item to cart', () => {
  // Arrange
  const cart = new ShoppingCart();
  const item = { id: '1', name: 'Book', price: 10 };

  // Act
  cart.addItem(item);

  // Assert
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBe(10);
});

// ❌ WRONG: Unclear structure
test('cart test', () => {
  const cart = new ShoppingCart();
  expect(cart.items).toHaveLength(0);
  cart.addItem({ id: '1', name: 'Book', price: 10 });
  expect(cart.items).toHaveLength(1);
  cart.removeItem('1');
  expect(cart.items).toHaveLength(0);
});
```

---

## 4. Test Naming

**Rule**: Test names should describe behavior, not implementation.

```typescript
// ✅ CORRECT: Describes behavior
test('throws error when email is invalid', () => { });
test('returns user when credentials are correct', () => { });
test('sends confirmation email after successful registration', () => { });

// ❌ WRONG: Describes implementation
test('validateEmail returns false', () => { });
test('checkCredentials works', () => { });
test('test registration', () => { });
```

---

## 5. One Assertion Per Test (Usually)

**Rule**: Each test should verify one behavior. Multiple assertions are OK if testing one concept.

```typescript
// ✅ CORRECT: Single behavior, related assertions
test('creates user with correct properties', () => {
  const user = createUser({ name: 'Alice', email: 'alice@example.com' });

  expect(user.name).toBe('Alice');
  expect(user.email).toBe('alice@example.com');
  expect(user.createdAt).toBeInstanceOf(Date);
});

// ❌ WRONG: Multiple unrelated behaviors
test('user functions', () => {
  const user = createUser({ name: 'Alice' });
  expect(user.name).toBe('Alice');

  user.login();
  expect(user.isLoggedIn).toBe(true);

  user.updateProfile({ age: 30 });
  expect(user.age).toBe(30);
});
```

---

## 6. Test Independence

**Rule**: Tests must not depend on each other. Order shouldn't matter.

```typescript
// ✅ CORRECT: Independent tests
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  test('creates user', () => {
    const user = userService.create({ name: 'Alice' });
    expect(user.name).toBe('Alice');
  });

  test('finds user by id', () => {
    const user = userService.create({ name: 'Bob' });
    const found = userService.findById(user.id);
    expect(found).toEqual(user);
  });
});

// ❌ WRONG: Tests depend on each other
let userId: string;

test('creates user', () => {
  const user = userService.create({ name: 'Alice' });
  userId = user.id; // Shared state!
});

test('finds user', () => {
  const user = userService.findById(userId); // Depends on previous test
  expect(user.name).toBe('Alice');
});
```

---

## 7. Mock External Dependencies

**Rule**: Mock APIs, databases, file system, and other external dependencies.

```typescript
// ✅ CORRECT: Mocked external API
test('fetches user data', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    json: async () => ({ id: '1', name: 'Alice' })
  });

  global.fetch = mockFetch;

  const user = await fetchUser('1');
  expect(user.name).toBe('Alice');
});

// ✅ CORRECT: Mocked database
test('saves user to database', async () => {
  const mockDb = {
    save: jest.fn().mockResolvedValue({ id: '1' })
  };

  const result = await userRepository.save(mockDb, { name: 'Alice' });
  expect(mockDb.save).toHaveBeenCalledWith({ name: 'Alice' });
});
```

---

## 8. Test Edge Cases

**Rule**: Test happy path, error cases, and edge cases.

```typescript
describe('divide', () => {
  // Happy path
  test('divides positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  // Error case
  test('throws when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  // Edge cases
  test('handles negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  test('handles decimal results', () => {
    expect(divide(10, 3)).toBeCloseTo(3.33, 2);
  });

  test('handles very large numbers', () => {
    expect(divide(Number.MAX_VALUE, 2)).toBeLessThan(Number.MAX_VALUE);
  });
});
```

---

## 9. Integration Tests

**Rule**: Write integration tests for critical user flows.

```typescript
// Integration test: Tests multiple components together
test('user registration flow', async () => {
  // Create user
  const user = await request(app)
    .post('/api/register')
    .send({ email: 'alice@example.com', password: 'secret123' });

  expect(user.status).toBe(201);

  // Verify email sent
  const emails = await getTestEmails();
  expect(emails).toHaveLength(1);
  expect(emails[0].to).toBe('alice@example.com');

  // Verify database entry
  const dbUser = await db.users.findOne({ email: 'alice@example.com' });
  expect(dbUser).toBeTruthy();
});
```

---

## 10. Performance Tests

**Rule**: Test performance for critical operations.

```typescript
test('processes 1000 items in under 100ms', () => {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

  const start = Date.now();
  processItems(items);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(100);
});
```

---

## Testing Pyramid

Maintain this ratio:
- **70% Unit Tests**: Fast, isolated, test individual functions
- **20% Integration Tests**: Test component interactions
- **10% E2E Tests**: Test full user workflows

---

## Testing Checklist

Before every commit:
- [ ] All tests pass
- [ ] New features have tests
- [ ] Coverage meets minimum (80%)
- [ ] Tests follow AAA pattern
- [ ] Tests are independent
- [ ] External dependencies mocked
- [ ] Edge cases covered
- [ ] Integration tests for new flows

---

## Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- UserService.test.ts

# Run in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

---

## Resources

- Jest Documentation: https://jestjs.io/
- Testing Library: https://testing-library.com/
- Kent C. Dodds' Testing Guide: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
