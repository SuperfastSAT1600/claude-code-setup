# Documentation Rules

Standards for code documentation, comments, and project docs.

---

## 1. When to Document

**Rule**: Document the "why", not the "what". Code should be self-explanatory.

### Document When:
- ✅ Complex business logic that isn't obvious
- ✅ Non-obvious performance optimizations
- ✅ Workarounds for bugs in dependencies
- ✅ Public APIs (functions, classes, modules)
- ✅ Configuration options
- ✅ Architecture decisions

### Don't Document:
- ❌ Obvious code (self-documenting)
- ❌ Implementation details that may change
- ❌ What the code does (read the code)
- ❌ Every function (only public APIs)

---

## 2. Code Comments

**Rule**: Comments explain why, not what.

### Good Comments:
```typescript
// Using exponential backoff to avoid overwhelming the API
// after a rate limit response (429)
const delay = Math.pow(2, attempt) * 1000;

// HACK: Working around a bug in react-query v4.x where
// staleTime of 0 doesn't trigger immediate refetch.
// TODO: Remove after upgrading to v5 (issue #123)
const staleTime = 1;

// Business rule: Premium users get 20% discount on all orders
// over $100. This was requested by marketing in Q4 2023.
const discount = user.isPremium && total > 100 ? 0.2 : 0;
```

### Bad Comments:
```typescript
// ❌ States the obvious
// Increment counter
counter++;

// ❌ Outdated/wrong comment
// Returns user's full name
function getUserEmail(user: User) {
  return user.email;
}

// ❌ Commented-out code (just delete it)
// function oldImplementation() { ... }
```

---

## 3. JSDoc/TSDoc Standards

**Rule**: Document public APIs with JSDoc.

### Function Documentation:
```typescript
/**
 * Calculates the total price including tax and discounts.
 *
 * The calculation follows these rules:
 * 1. Apply item-level discounts first
 * 2. Apply order-level discount (if any)
 * 3. Add tax based on shipping address
 *
 * @param items - Array of cart items with quantities
 * @param discount - Optional order-level discount (0-1)
 * @param taxRate - Tax rate based on shipping state (0-1)
 * @returns Total price in cents
 *
 * @example
 * const total = calculateTotal(
 *   [{ price: 1000, quantity: 2 }],
 *   0.1,  // 10% discount
 *   0.08  // 8% tax
 * );
 * // Returns: 1944 (2000 - 200 + 144)
 *
 * @throws {ValidationError} If items array is empty
 * @throws {ValidationError} If discount is not between 0 and 1
 */
function calculateTotal(
  items: CartItem[],
  discount?: number,
  taxRate?: number
): number {
  // Implementation
}
```

### Class Documentation:
```typescript
/**
 * Service for managing user authentication and sessions.
 *
 * Handles:
 * - User registration and login
 * - Password reset flows
 * - Session management
 * - Token refresh
 *
 * @example
 * const authService = new AuthService(userRepo, emailService);
 * const tokens = await authService.login(email, password);
 */
class AuthService {
  /**
   * Creates a new AuthService instance.
   *
   * @param userRepository - Repository for user data access
   * @param emailService - Service for sending emails
   * @param config - Optional configuration overrides
   */
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private config: AuthConfig = defaultConfig
  ) {}
}
```

### Type Documentation:
```typescript
/**
 * Configuration options for the API client.
 */
interface ApiClientConfig {
  /** Base URL for all API requests */
  baseUrl: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;

  /**
   * Custom headers to include in all requests.
   * Authorization header is added automatically.
   */
  headers?: Record<string, string>;
}
```

---

## 4. README Structure

**Rule**: Every project needs a README with essential information.

### Required Sections:
```markdown
# Project Name

Brief description of what the project does.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install
```

## Quick Start

```bash
npm run dev
```

## Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DATABASE_URL | PostgreSQL connection string | Yes | - |
| PORT | Server port | No | 3000 |

## Usage

Basic usage examples...

## API Reference

Link to API documentation or brief overview.

## Contributing

How to contribute to the project.

## License

MIT
```

---

## 5. API Documentation

**Rule**: All APIs must have comprehensive documentation.

### OpenAPI/Swagger:
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List all users
      description: |
        Returns a paginated list of users. Supports filtering
        by role and status.
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
          description: Page number for pagination
        - name: role
          in: query
          schema:
            type: string
            enum: [admin, user]
          description: Filter by user role
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

### Inline Documentation:
```typescript
/**
 * @api {get} /users List Users
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [perPage=20] Items per page
 * @apiQuery {String="admin","user"} [role] Filter by role
 *
 * @apiSuccess {Object[]} data List of users
 * @apiSuccess {String} data.id User ID
 * @apiSuccess {String} data.email User email
 *
 * @apiError (401) Unauthorized Authentication required
 * @apiError (403) Forbidden Insufficient permissions
 */
router.get('/users', listUsers);
```

---

## 6. Architecture Documentation

**Rule**: Document significant architecture decisions.

### Architecture Decision Record (ADR):
```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need to choose a primary database for our application.
Requirements:
- ACID compliance for financial data
- JSON support for flexible schemas
- Strong ecosystem and tooling
- Good performance at our scale (10M rows)

## Decision
We will use PostgreSQL 15 as our primary database.

## Consequences

### Positive
- ACID compliance for transactions
- Excellent JSON support (JSONB)
- Rich ecosystem (Prisma, pg, etc.)
- Strong community support

### Negative
- More complex setup than SQLite
- Requires connection pooling for high concurrency
- Migrations required for schema changes

### Risks
- Need to monitor connection pool exhaustion
- May need read replicas if read traffic grows significantly

## Alternatives Considered
- MySQL: Less JSON support
- MongoDB: No ACID for complex transactions
- SQLite: Not suitable for concurrent access
```

---

## 7. Changelog

**Rule**: Maintain a changelog for user-facing changes.

### Format (Keep a Changelog):
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- User profile page with avatar upload

### Changed
- Improved login form validation messages

## [1.2.0] - 2024-01-15

### Added
- Bulk user import via CSV
- Dark mode support
- API rate limiting

### Changed
- Upgraded to Next.js 14
- Improved error messages

### Deprecated
- Legacy authentication endpoints (use /v2/auth instead)

### Removed
- Support for Node.js 16 (EOL)

### Fixed
- Date picker timezone bug (#234)
- Memory leak in WebSocket connections (#256)

### Security
- Updated jsonwebtoken to fix CVE-2022-23529
```

---

## 8. Inline Documentation

**Rule**: Use inline comments sparingly but effectively.

### TODO Comments:
```typescript
// TODO(username): Brief description - Issue #123
// TODO: Implement caching for this query - #456
```

### FIXME Comments:
```typescript
// FIXME: This breaks when quantity is 0 - #789
// FIXME(urgent): Race condition in concurrent updates
```

### HACK Comments:
```typescript
// HACK: Workaround for react-query bug, remove in v5
// See: https://github.com/tanstack/query/issues/1234
```

---

## 9. Documentation Maintenance

**Rule**: Keep documentation in sync with code.

### When to Update Docs:
- API endpoint changes
- Configuration option changes
- New features added
- Breaking changes
- Deprecations

### Documentation Review Checklist:
- [ ] README reflects current state
- [ ] API docs match implementation
- [ ] CHANGELOG updated for release
- [ ] JSDoc is accurate
- [ ] Examples still work
- [ ] Links are not broken

---

## Documentation Checklist

### Code Level:
- [ ] Complex logic has comments explaining "why"
- [ ] Public APIs have JSDoc
- [ ] Types are documented
- [ ] Examples included for non-obvious usage

### Project Level:
- [ ] README is complete and current
- [ ] API documentation exists
- [ ] CHANGELOG is maintained
- [ ] Environment variables documented
- [ ] Architecture decisions recorded

---

## Resources

- [JSDoc Reference](https://jsdoc.app/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Architecture Decision Records](https://adr.github.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
