# Documentation Patterns

Best practices for writing and maintaining technical documentation.

---

## Documentation Types

### By Audience
| Type | Audience | Purpose |
|------|----------|---------|
| README | New users | Project overview, quick start |
| API Docs | Developers | Endpoint reference, examples |
| Architecture | Team | System design, decisions |
| User Guide | End users | How to use features |
| Contribution | Contributors | How to contribute |

### By Content
| Type | When to Write |
|------|---------------|
| Tutorials | Learning-oriented, "how to get started" |
| How-to Guides | Problem-oriented, "how to solve X" |
| Reference | Information-oriented, "API specs" |
| Explanation | Understanding-oriented, "why we do X" |

---

## README Structure

### Essential Sections
```markdown
# Project Name

Brief description (1-2 sentences).

## Features
- Key feature 1
- Key feature 2

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## Documentation
- [Installation Guide](docs/installation.md)
- [API Reference](docs/api.md)

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License
MIT
```

### Extended README
```markdown
# Project Name

[![CI](badge-url)](action-url)
[![License](badge-url)](license-url)

Brief description explaining what the project does and why it exists.

## Features
- Feature with brief explanation
- Another feature

## Prerequisites
- Node.js 20+
- PostgreSQL 15+

## Installation
\`\`\`bash
git clone https://github.com/org/repo
cd repo
npm install
cp .env.example .env
npm run dev
\`\`\`

## Usage
Basic usage example with code.

## Configuration
| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | Connection string | Yes |

## Architecture
Brief overview with diagram link.

## Contributing
1. Fork the repo
2. Create feature branch
3. Submit PR

## License
MIT - see [LICENSE](LICENSE)
```

---

## Code Documentation

### JSDoc for Functions
```typescript
/**
 * Calculates the total price with tax and discounts.
 *
 * @param items - Array of cart items
 * @param options - Calculation options
 * @param options.taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param options.discountCode - Optional discount code
 * @returns Total price in cents
 * @throws {ValidationError} If items array is empty
 *
 * @example
 * ```ts
 * const total = calculateTotal(
 *   [{ price: 1000, quantity: 2 }],
 *   { taxRate: 0.08 }
 * );
 * // Returns: 2160
 * ```
 */
function calculateTotal(
  items: CartItem[],
  options: CalculateOptions
): number {
  // ...
}
```

### JSDoc for Types
```typescript
/**
 * Represents a user in the system.
 */
interface User {
  /** Unique identifier */
  id: string;
  /** Email address (must be unique) */
  email: string;
  /** Display name */
  name: string;
  /** Account creation timestamp */
  createdAt: Date;
  /** User's role for authorization */
  role: 'admin' | 'user' | 'guest';
}
```

### When to Comment
```typescript
// ✅ DO: Explain WHY, not WHAT
// Using exponential backoff to avoid overwhelming the API
// after temporary failures (per API guidelines section 4.2)
const delay = Math.pow(2, attempt) * 1000;

// ✅ DO: Document complex algorithms
// Floyd's cycle detection: fast pointer moves 2x, slow 1x
// When they meet, there's a cycle
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) return true;
}

// ❌ DON'T: State the obvious
// Increment counter
counter++;

// ❌ DON'T: Repeat the code
// Set user to null
user = null;
```

---

## API Documentation

### OpenAPI/Swagger
```yaml
openapi: 3.0.3
info:
  title: User API
  version: 1.0.0
  description: API for managing users

paths:
  /users:
    get:
      summary: List all users
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
```

### Endpoint Documentation
```markdown
## Create User

Creates a new user account.

**Endpoint:** `POST /api/users`

**Authentication:** Required (Bearer token)

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| name | string | Yes | Display name (2-100 chars) |
| role | string | No | User role (default: "user") |

**Example Request:**
\`\`\`bash
curl -X POST https://api.example.com/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
\`\`\`

**Success Response (201):**
\`\`\`json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

**Error Responses:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input |
| 409 | CONFLICT | Email already exists |
```

---

## Architecture Documentation

### Architecture Decision Record (ADR)
```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need a primary database for our application. Key requirements:
- ACID compliance for financial transactions
- JSON support for flexible schemas
- Good performance at expected scale (10k users)
- Team familiarity

## Options Considered

### 1. PostgreSQL
- Pros: ACID, JSONB, mature ecosystem, team experience
- Cons: Vertical scaling limits

### 2. MongoDB
- Pros: Flexible schema, horizontal scaling
- Cons: No ACID (until 4.0), less team experience

### 3. MySQL
- Pros: Simple, widely used
- Cons: Weaker JSON support, less advanced features

## Decision
Use PostgreSQL 15 as the primary database.

## Consequences
- Need to manage connection pooling (use PgBouncer)
- Team needs to learn PostgreSQL-specific features
- May need read replicas for scaling later

## Date
2024-01-15
```

### System Diagram
```markdown
## System Architecture

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API GW    │────▶│   Service   │
│  (Browser)  │     │  (Nginx)    │     │  (Node.js)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
             │  PostgreSQL │           │    Redis    │           │     S3      │
             │  (Primary)  │           │   (Cache)   │           │  (Storage)  │
             └─────────────┘           └─────────────┘           └─────────────┘
\`\`\`
```

---

## Changelog

### Format (Keep a Changelog)
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- New feature description

### Changed
- Changed feature description

## [1.2.0] - 2024-01-15

### Added
- User profile customization (#123)
- Dark mode support (#124)

### Changed
- Improved search performance by 50%

### Fixed
- Fixed date picker timezone bug (#125)

### Security
- Updated jsonwebtoken to fix CVE-2022-23529

## [1.1.0] - 2024-01-01
...
```

### Categories
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

---

## Writing Style

### Guidelines
1. **Be concise**: Respect reader's time
2. **Use active voice**: "The function returns" not "is returned by"
3. **Use second person**: "You can configure" not "Users can configure"
4. **Use present tense**: "The API returns" not "will return"
5. **Be consistent**: Same terms throughout

### Examples
```markdown
# Bad
The configuration file will be read by the system when it is started up.
Users should ensure that they have properly configured their environment.

# Good
The system reads the configuration file at startup.
Configure your environment before running the application.
```

### Code Examples
```markdown
# Bad
Here is some code that shows how to do it:
\`\`\`js
// do the thing
doThing()
\`\`\`

# Good
Create a user with the `createUser` function:
\`\`\`typescript
const user = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
});
console.log(user.id); // "abc123"
\`\`\`
```

---

## Documentation Maintenance

### Review Triggers
- [ ] Code changes affecting documented features
- [ ] API changes
- [ ] New features added
- [ ] Bug fixes that affect user behavior
- [ ] Dependency updates with breaking changes

### Automation
```yaml
# GitHub Action to check docs on PR
name: Docs Check
on: [pull_request]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for doc changes
        run: |
          if git diff --name-only origin/main | grep -q "src/"; then
            if ! git diff --name-only origin/main | grep -q "docs/\|README"; then
              echo "::warning::Code changed but no docs updated"
            fi
          fi
```

---

## Tools

### Documentation Generators
- **TypeDoc**: TypeScript API docs
- **Swagger/OpenAPI**: REST API docs
- **Docusaurus**: Documentation sites
- **Storybook**: Component documentation

### Linters
- **markdownlint**: Markdown style
- **vale**: Prose style
- **cspell**: Spell checking

---

## Resources

- Write the Docs: https://www.writethedocs.org/
- Google Developer Documentation Style Guide: https://developers.google.com/style
- Diátaxis Framework: https://diataxis.fr/
- Keep a Changelog: https://keepachangelog.com/
