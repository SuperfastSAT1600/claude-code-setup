# Skills Directory

This directory contains **reusable knowledge** that agents and commands can reference. Skills are like a library of best practices and patterns.

---

## What Are Skills?

Skills are markdown files containing:
- 📚 **Knowledge**: Best practices, patterns, methodologies
- 🔧 **How-To Guides**: Step-by-step instructions
- 📋 **Reference Material**: Code examples, templates

Skills differ from rules:
- **Rules** = Always enforced ("you must/must not")
- **Skills** = Referenced when needed ("here's how to do X well")

---

## Available Skills (14 Total)

### [`coding-standards.md`](coding-standards.md)
**Purpose**: Language-specific best practices and patterns

**Contains**:
- SOLID principles
- DRY, KISS, YAGNI principles
- Language-specific patterns (TypeScript, Python, Go, Rust)
- Modern syntax examples
- Code organization patterns

**Used By**:
- All agents when writing code
- `/refactor-clean` command
- Code review processes

**Example Topics**:
```typescript
// Dependency Injection (SOLID - Dependency Inversion)
class UserService {
  constructor(private db: Database) {}  // ✅ Injected dependency
}

// vs.

class UserService {
  private db = new Database();  // ❌ Hard-coded dependency
}
```

**When to Reference**: Writing new code, refactoring existing code

---

### [`backend-patterns.md`](backend-patterns.md)
**Purpose**: Server-side architecture and API design

**Contains**:
- RESTful API conventions
- Database patterns (Repository, Unit of Work)
- Caching strategies
- Authentication/authorization patterns
- Error handling patterns
- Background job processing
- Rate limiting

**Used By**:
- `architect` agent
- `planner` agent
- `/plan` command
- API development

**Example Topics**:
```typescript
// Repository Pattern
class UserRepository {
  async findById(id: string): Promise<User | null> {
    return await this.db.users.findUnique({ where: { id } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return await this.db.users.create({ data });
  }
}

// Controller uses repository, not direct DB access
class UserController {
  constructor(private userRepo: UserRepository) {}

  async getUser(req, res) {
    const user = await this.userRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ data: user });
  }
}
```

**When to Reference**: Building APIs, designing backend architecture

---

### [`frontend-patterns.md`](frontend-patterns.md)
**Purpose**: Client-side architecture and UI patterns

**Contains**:
- React patterns (hooks, context, composition)
- State management strategies
- Performance optimization
- Form handling
- API integration patterns
- Component organization

**Used By**:
- `architect` agent
- `refactor-cleaner` agent
- `/e2e` command (for component testing)
- UI development

**Example Topics**:
```typescript
// Compound Components Pattern
export function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

**When to Reference**: Building UI components, optimizing performance

---

### [`tdd-workflow.md`](tdd-workflow.md)
**Purpose**: Test-Driven Development methodology

**Contains**:
- Red-Green-Refactor cycle
- Test organization (AAA pattern)
- Outside-in TDD
- Test doubles (mocks, stubs, fakes)
- When to use TDD vs. test-after

**Used By**:
- `tdd-guide` agent
- `/tdd` command
- Test generation

**Example Workflow**:
```typescript
// 1. RED: Write failing test
test('should calculate total price with tax', () => {
  const order = new Order([{ price: 100 }]);
  expect(order.getTotalWithTax(0.1)).toBe(110);
});
// Test fails: getTotalWithTax is not implemented

// 2. GREEN: Write minimum code to pass
class Order {
  getTotalWithTax(taxRate: number) {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    return subtotal * (1 + taxRate);
  }
}
// Test passes!

// 3. REFACTOR: Improve code
class Order {
  private getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  getTotalWithTax(taxRate: number) {
    return this.getSubtotal() * (1 + taxRate);
  }
}
// Test still passes, code is cleaner
```

**When to Reference**: Writing tests, implementing features test-first

---

### [`project-guidelines.md`](project-guidelines.md)
**Purpose**: Template for project-specific customization

**Contains**:
- Project tech stack documentation
- Architecture overview
- Domain-specific patterns
- Team conventions
- Common pitfalls

**Used By**:
- New team members (onboarding)
- All agents (project context)
- Documentation updates

**Example Sections**:
```markdown
## Project-Specific Patterns

### API Response Format
All API responses follow this structure:

Success:
{
  "data": { /* response data */ },
  "meta": { "timestamp": "2024-01-20T10:30:00Z" }
}

Error:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

**When to Reference**: Starting work on project, documenting decisions

---

### [`user-intent-patterns.md`](user-intent-patterns.md)
**Purpose**: Natural language intent detection and routing

**Contains**:
- Intent classification patterns
- Keyword-to-action mappings
- Disambiguation strategies
- Non-technical communication patterns

**Used By**:
- Intent routing rules
- Non-technical mode rules
- All user-facing interactions

**Example Topics**:
```markdown
## Intent Keywords

**Feature Requests**: "I want...", "Add...", "Build...", "Create..."
→ Routes to /full-feature workflow

**Bug Reports**: "Fix...", "Broken...", "Error...", "Not working..."
→ Routes to /quick-fix workflow

**Security Concerns**: "Secure?", "Safe?", "Vulnerable?"
→ Routes to /security-review command
```

**When to Reference**: Processing user requests, determining appropriate automation

---

## How Skills Work

### On-Demand Reference
Skills are loaded when relevant to the current task:
- Agent needs to implement a pattern → loads appropriate skill
- Command executes → references related skills
- User asks "how to do X" → finds relevant skill

### Not Always Active
Unlike rules (always enforced), skills are referenced when useful.

### Composable
Agents can combine multiple skills:
```
planner agent planning API feature:
→ References backend-patterns.md (API design)
→ References coding-standards.md (SOLID principles)
→ References tdd-workflow.md (test strategy)
```

---

## When to Create a New Skill

Create a new skill when you have:
- ✅ Reusable knowledge that applies to multiple features
- ✅ Best practices you want agents to follow consistently
- ✅ Complex patterns that need detailed explanation
- ✅ Domain-specific knowledge (e.g., payment processing patterns)

**Don't** create a skill for:
- ❌ One-time implementation details
- ❌ Project-specific configuration (put in CLAUDE.md)
- ❌ Enforcement rules (put in rules/)
- ❌ Simple facts (put in project documentation)

---

## Creating a New Skill

### Template

```markdown
# [Skill Name]

[One-line description of what this skill teaches]

---

## Core Concepts

[Explain the fundamental ideas]

---

## Patterns

### Pattern 1: [Name]
**When to use**: [Use case]

**Implementation**:
\`\`\`[language]
[code example]
\`\`\`

**Benefits**:
- [Benefit 1]
- [Benefit 2]

**Trade-offs**:
- [Trade-off 1]
- [Trade-off 2]

---

### Pattern 2: [Name]
[Repeat structure]

---

## Best Practices

- ✅ [Do this]
- ❌ [Don't do this]

---

## Common Mistakes

### Mistake 1: [Name]
**Problem**: [What people do wrong]
**Why it's wrong**: [Explanation]
**Correct approach**: [How to do it right]

---

## Examples

### Example 1: [Scenario]
[Complete working example]

### Example 2: [Scenario]
[Complete working example]

---

## Resources

- [External documentation]
- [Related skills]
```

---

## Skill Organization

### Keep Focused
Each skill should cover **one topic area**:
- ✅ `backend-patterns.md` - All backend patterns
- ❌ `patterns.md` - Too broad

### Use Clear Names
```
✅ authentication-patterns.md
✅ caching-strategies.md
✅ database-optimization.md

❌ stuff.md
❌ misc-patterns.md
❌ tips.md
```

### Include Examples
Every pattern should have:
1. Description
2. Code example
3. When to use it
4. When NOT to use it

---

## Customizing Skills for Your Project

### 1. Review Existing Skills
Read through each skill and assess relevance to your stack.

### 2. Add Project-Specific Skills
```bash
# Example: E-commerce-specific patterns
touch .claude/skills/ecommerce-patterns.md

# Example: Mobile development patterns
touch .claude/skills/mobile-patterns.md

# Example: Data pipeline patterns
touch .claude/skills/data-engineering.md
```

### 3. Enhance Generic Skills
Add your own examples to existing skills:
```markdown
<!-- In backend-patterns.md -->

## Project-Specific: Payment Processing

We use Stripe for payments. Always follow this pattern:

\`\`\`typescript
// Our standard payment flow
async function processPayment(orderId: string) {
  // 1. Create payment intent
  const intent = await stripe.paymentIntents.create({ /* ... */ });

  // 2. Attach to order
  await db.orders.update({
    where: { id: orderId },
    data: { stripeIntentId: intent.id }
  });

  // 3. Return client secret
  return { clientSecret: intent.client_secret };
}
\`\`\`
```

---

## Skill Usage Examples

### Example 1: Agent References Skill

**User**: "Implement user authentication"

**Planner Agent**:
1. Loads `backend-patterns.md` → Authentication section
2. Loads `coding-standards.md` → Security best practices
3. Loads `tdd-workflow.md` → Test strategy
4. Creates plan combining all three

### Example 2: Command Uses Skill

**User**: `/refactor-clean src/auth/`

**Refactor-Cleaner Agent**:
1. Loads `coding-standards.md` → Identifies modern patterns
2. Loads `backend-patterns.md` → Finds auth patterns
3. Compares current code to patterns
4. Refactors to match best practices

### Example 3: User References Skill

**User**: "What's the best way to handle forms in React?"

**Claude**:
1. Reads `frontend-patterns.md` → Form handling section
2. Provides examples from skill
3. Explains when to use each pattern

---

## Skill Maintenance

### Keep Up-to-Date
- [ ] Update when new framework versions released
- [ ] Add new patterns as discovered
- [ ] Remove deprecated patterns
- [ ] Refresh examples to match current code

### Regular Review
- **Monthly**: Review with team, update examples
- **After major refactor**: Document new patterns learned
- **When onboarding**: Ask new team members what's unclear

### Version Control
Skills are committed to git. When you improve a skill, the whole team benefits.

---

## Skill vs. Rule vs. CLAUDE.md

| Type | Purpose | When Active | Examples |
|------|---------|-------------|----------|
| **Rule** | Enforce standards | Always | "No hardcoded secrets", "80% test coverage" |
| **Skill** | Teach patterns | When relevant | "How to implement auth", "API design patterns" |
| **CLAUDE.md** | Project specifics | Always | "We use Stripe for payments", "Auth goes in /auth route" |

**Use Rule**: When you need enforcement
**Use Skill**: When you need education
**Use CLAUDE.md**: When it's project-specific

---

## Troubleshooting

### "Agent isn't using a skill"
- Skills are referenced when relevant to the task
- Try explicitly mentioning: "Use the backend-patterns skill"
- Check if task matches skill's domain

### "Skill content is out of date"
- Update the skill file
- Skills are immediately available after editing
- Consider automating checks in CI/CD

### "Skill is too long"
- Split into multiple focused skills
- Move project-specific parts to CLAUDE.md
- Keep core patterns, remove redundant examples

---

## Examples of Good Skills

**Good Skill** (Comprehensive, Practical):
```markdown
# Caching Strategies

## When to Cache

Cache data that is:
- ✅ Read frequently
- ✅ Expensive to compute
- ✅ Changes infrequently

Don't cache data that is:
- ❌ User-specific and sensitive
- ❌ Changes constantly
- ❌ Cheap to compute

## Patterns

### Pattern 1: Cache-Aside
[Complete implementation with code]

### Pattern 2: Write-Through
[Complete implementation with code]

## Examples

[Real-world scenarios with full code]
```

**Bad Skill** (Vague, Incomplete):
```markdown
# Caching

Caching is good. Use Redis.
```

---

## Resources

### Meta Skills
- [Coding Standards](coding-standards.md)
- [Backend Patterns](backend-patterns.md)
- [Frontend Patterns](frontend-patterns.md)
- [TDD Workflow](tdd-workflow.md)
- [Project Guidelines](project-guidelines.md)
- [User Intent Patterns](user-intent-patterns.md)

### Framework Skills
- [React Patterns](react-patterns.md)
- [Next.js Patterns](nextjs-patterns.md)
- [Node.js Patterns](nodejs-patterns.md)
- [Database Patterns](database-patterns.md)
- [GitHub Actions](github-actions.md)

### API & Real-time Skills
- [REST API Design](rest-api-design.md)
- [GraphQL Patterns](graphql-patterns.md)
- [WebSocket Patterns](websocket-patterns.md)

---

**Remember**: Skills are teaching tools. Make them clear, practical, and filled with examples. When in doubt, add more code examples!
