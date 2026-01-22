# Documentation Rules

Standards for code documentation.

---

## 1. When to Document

**Rule**: Document "why", not "what". Code should be self-explanatory.

### Document
- ✅ Complex business logic
- ✅ Non-obvious performance optimizations
- ✅ Workarounds for dependency bugs
- ✅ Public APIs
- ✅ Architecture decisions

### Don't Document
- ❌ Obvious code
- ❌ What code does (read it)
- ❌ Every function (only public APIs)

---

## 2. Code Comments

**Rule**: Comments explain why, not what.

```typescript
// ✅ Good: Explains why
// Using exponential backoff to avoid overwhelming API after 429
const delay = Math.pow(2, attempt) * 1000;

// ✅ Good: Business rule
// Premium users get 20% discount on orders >$100 (Q4 2023 marketing request)
const discount = user.isPremium && total > 100 ? 0.2 : 0;

// ❌ Bad: States obvious
// Increment counter
counter++;
```

---

## 3. JSDoc

**Rule**: Document public APIs.

```typescript
/**
 * Calculates total price with tax and discounts.
 * @param items - Cart items
 * @param discount - Order discount (0-1)
 * @param taxRate - Tax rate (0-1)
 * @returns Total in cents
 * @throws {ValidationError} If items empty or discount invalid
 */
function calculateTotal(items: CartItem[], discount?: number, taxRate?: number): number
```

### Type Documentation
```typescript
interface ApiClientConfig {
  /** Base URL for requests */
  baseUrl: string;
  /** Timeout in ms (default: 30000) */
  timeout?: number;
}
```

---

## 4. README Structure

```markdown
# Project Name
Brief description.

## Features
- Feature 1

## Installation
npm install

## Quick Start
npm run dev

## Configuration
| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection | Yes |

## License
MIT
```

---

## 5. ADR Format

```markdown
# ADR-001: Use PostgreSQL

## Status
Accepted

## Context
Need ACID compliance, JSON support, good tooling.

## Decision
PostgreSQL 15.

## Consequences
+ ACID, JSONB, ecosystem
- Setup complexity, connection pooling needed
```

---

## 6. Changelog

Follow [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.2.0] - 2024-01-15
### Added
- Dark mode
### Fixed
- Date picker timezone (#234)
### Security
- Updated jsonwebtoken (CVE-2022-23529)
```

---

## 7. Inline Tags

```typescript
// TODO(user): Description - #123
// FIXME: Race condition - #456
// HACK: Workaround for bug, remove in v5
```

---

## Checklist

### Code
- [ ] Complex logic has "why" comments
- [ ] Public APIs have JSDoc
- [ ] No obvious/redundant comments

### Project
- [ ] README is current
- [ ] CHANGELOG maintained
- [ ] Env vars documented
- [ ] ADRs for major decisions
