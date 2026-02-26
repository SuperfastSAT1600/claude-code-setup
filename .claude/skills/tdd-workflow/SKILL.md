---
name: tdd-workflow
description: Test-Driven Development methodology following the Red-Green-Refactor cycle for writing robust, well-tested code.
---

# TDD Workflow

Test-Driven Development methodology and best practices.

---

## The TDD Cycle

### Red-Green-Refactor

1. **RED**: Write a failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

```typescript
// 1. RED: Write failing test
describe('calculateDiscount', () => {
  it('applies 10% discount for premium users', () => {
    const result = calculateDiscount(100, 'premium');
    expect(result).toBe(90);
  });
});

// 2. GREEN: Make it pass
function calculateDiscount(price: number, tier: string): number {
  if (tier === 'premium') return price * 0.9;
  return price;
}

// 3. REFACTOR: Improve
const DISCOUNTS = {
  premium: 0.1,
  standard: 0
};

function calculateDiscount(price: number, tier: keyof typeof DISCOUNTS): number {
  return price * (1 - DISCOUNTS[tier]);
}
```

---

## TDD Process

### 1. Start with Requirements
```
Feature: User can add items to cart
Given: Empty cart
When: User adds item
Then: Cart contains 1 item
```

### 2. Write Test First
```typescript
test('adds item to cart', () => {
  const cart = new ShoppingCart();
  const item = { id: '1', name: 'Book', price: 10 };

  cart.addItem(item);

  expect(cart.items).toHaveLength(1);
  expect(cart.items[0]).toEqual(item);
});
```

### 3. See It Fail
```
Error: ShoppingCart is not defined
```

### 4. Write Minimal Code
```typescript
class ShoppingCart {
  items: Item[] = [];

  addItem(item: Item) {
    this.items.push(item);
  }
}
```

### 5. See It Pass
```
✓ adds item to cart
```

### 6. Refactor
```typescript
class ShoppingCart {
  private _items: Item[] = [];

  get items(): readonly Item[] {
    return this._items;
  }

  addItem(item: Item): void {
    this._items.push(item);
  }
}
```

---

## Test Organization

### AAA Pattern
```typescript
test('calculates total with multiple items', () => {
  // Arrange
  const cart = new ShoppingCart();
  const item1 = { id: '1', price: 10 };
  const item2 = { id: '2', price: 20 };

  // Act
  cart.addItem(item1);
  cart.addItem(item2);

  // Assert
  expect(cart.total).toBe(30);
});
```

### Test Naming
```typescript
// ✅ Descriptive
test('throws error when adding duplicate item', () => {});
test('applies discount after adding 5 items', () => {});
test('removes item by id', () => {});

// ❌ Vague
test('cart test', () => {});
test('test addItem', () => {});
```

---

## TDD Anti-Patterns

### ❌ Testing Implementation
```typescript
// Bad: Tests internal structure
test('calls calculateDiscount method', () => {
  const spy = jest.spyOn(cart, 'calculateDiscount');
  cart.checkout();
  expect(spy).toHaveBeenCalled();
});
```

### ✅ Testing Behavior
```typescript
// Good: Tests observable behavior
test('applies discount on checkout', () => {
  cart.addItem({ price: 100 });
  const total = cart.checkout();
  expect(total).toBe(90); // 10% discount applied
});
```

---

## Outside-In TDD

### 1. Start with Acceptance Test
```typescript
test('user can complete purchase', async () => {
  const user = await createUser();
  const cart = await addItemsToCart(user, [item1, item2]);
  const order = await checkout(cart);

  expect(order.status).toBe('completed');
  expect(order.total).toBe(30);
});
```

### 2. Drive Out Components
```typescript
// Implement addItemsToCart
test('addItemsToCart adds multiple items', () => {
  // ...
});

// Implement checkout
test('checkout creates order', () => {
  // ...
});
```

---

## TDD Benefits

1. **Design Tool**: Forces you to think about API before implementation
2. **Documentation**: Tests show how code should be used
3. **Confidence**: Refactor fearlessly with test safety net
4. **Fewer Bugs**: Catch issues early
5. **Better Architecture**: Testable code is usually better structured

---

## Spec-Driven TDD

When working with a spec (`.claude/templates/spec.md.template`), map tests directly to requirement IDs:

```typescript
// Test names include REQ ID for traceability
test('REQ-001: user can register with valid email', () => {
  const result = register({ email: 'user@example.com', password: 'Str0ng!' });
  expect(result.success).toBe(true);
});

test('REQ-002: registration rejects invalid email', () => {
  const result = register({ email: 'invalid', password: 'Str0ng!' });
  expect(result.error).toBe('INVALID_EMAIL');
});

test('REQ-003: confirmation email is sent after registration', () => {
  register({ email: 'user@example.com', password: 'Str0ng!' });
  expect(mockMailer.sent).toHaveLength(1);
});
```

**Verification tag mapping**:
- `(TEST)` requirements → Unit/integration tests (Phases 1-2 of test ladder)
- `(BROWSER)` requirements → Playwright/Cypress E2E tests (Phase 3)
- `(MANUAL)` requirements → Human checklist (Phase 4)

---

## Mutation Testing

Mutation testing validates that your tests actually catch bugs — not just that they run green.

### What It Does
A mutation tool (like Stryker) modifies your code (e.g., changes `>` to `>=`, removes a return) and checks if your tests catch the change. If they don't, you have a "surviving mutant" — a gap in your test coverage.

### When to Use
- Critical business logic (payments, auth, data validation)
- After achieving high line coverage but wanting confidence
- Pre-release verification for core modules

### Setup (Stryker for JS/TS)
```bash
npx stryker init
```

### Running
```bash
npx stryker run --reporters clear-text
```

### Target Scores
- Critical business logic: ≥70% mutation score
- General code: ≥50% mutation score
- Configuration/glue code: not required

### Integration with Checkpoint
When Stryker is configured (`stryker.conf.js` or `stryker.conf.mjs`), the `/checkpoint` command automatically runs mutation testing as an optional step.

---

## When to Use TDD

### ✅ Use TDD For:
- Business logic
- Complex algorithms
- Critical features
- Bug fixes (write test that reproduces bug)
- Public APIs

### ⚠️ TDD Less Useful For:
- UI layout
- Exploratory code (spike then TDD)
- Simple getters/setters
- Configuration

---

## Resources

- Test-Driven Development by Kent Beck
- Growing Object-Oriented Software, Guided by Tests
- Stryker Mutator: https://stryker-mutator.io
