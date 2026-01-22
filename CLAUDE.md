# Team Claude Code Guidelines

This file contains guidelines and learnings for Claude Code to prevent repeated mistakes and maintain consistency across the team.

## Purpose

This is our team's shared knowledge base for Claude Code. When Claude makes a mistake or does something incorrectly, we add it here so it learns from our specific project needs and doesn't repeat the same errors.

## How to Use This File

1. **During Development**: When Claude does something wrong, immediately add a note here
2. **During Code Review**: Tag `@.claude` in PRs to suggest additions to this file
3. **Weekly Updates**: Team members should review and update this file regularly
4. **Keep it Current**: Remove outdated rules as the project evolves

---

**Available agents (34 total)**: planner, architect, security-reviewer, code-reviewer, verify-app, code-simplifier, refactor-cleaner, tech-debt-analyzer, type-safety-enforcer, tdd-guide, unit-test-writer, integration-test-writer, e2e-runner, load-test-specialist, implementer, api-designer, database-architect, auth-specialist, graphql-specialist, websocket-specialist, build-error-resolver, ci-cd-specialist, docker-specialist, migration-specialist, dependency-manager, accessibility-auditor, i18n-specialist, doc-updater, performance-optimizer, monitoring-architect, runbook-writer, mobile-specialist, ai-integration-specialist, iac-specialist. See INDEX.md for full list.

### 📚 Knowledge Base
- **Skills** (`.claude/skills/`) - Reference patterns: react-patterns, nextjs-patterns, rest-api-design, graphql-patterns, websocket-patterns, and more
- **Rules** (`.claude/rules/`) - Auto-enforced: security, coding-style, testing, git-workflow, performance
- **Workflows** (`.claude/workflows/`) - Step-by-step guides: full-feature, bug-fix, refactor, release, security-audit
- **Checklists** (`.claude/checklists/`) - Quality verification: pr-review, security-audit, performance-audit, accessibility-audit, pre-release
- **Templates** (`.claude/templates/`) - Code scaffolding: component.tsx, api-route.ts, test.spec.ts, migration.sql, pr-description.md

---

## Automatic Intent Detection (Non-Technical Mode)

**You don't need to know commands or agent names.** Just describe what you want in plain English, and the appropriate automation will be selected automatically.

### How It Works

Simply describe what you want to accomplish:

| You say... | What happens |
|------------|--------------|
| "I want users to log in" | Automatically runs full-feature workflow with auth-specialist |
| "The checkout is broken" | Automatically runs quick-fix workflow |
| "Is this code secure?" | Automatically runs security review |
| "Make the page faster" | Automatically delegates to performance-optimizer |
| "Add tests for this" | Automatically runs test-coverage |
| "Clean up this code" | Automatically runs refactor-clean |

### Intent Keywords

**Features** (triggers /full-feature):
- "I want...", "Add...", "Create...", "Build...", "Enable..."

**Bug Fixes** (triggers /quick-fix):
- "Fix...", "Broken...", "Not working...", "Error...", "Bug..."

**Reviews** (triggers /review-changes):
- "Review...", "Check...", "Is this okay?", "How does this look?"

**Security** (triggers /security-review):
- "Secure?", "Safe?", "Vulnerable?", "Audit..."

**Performance** (delegates to performance-optimizer):
- "Slow...", "Fast...", "Speed up...", "Optimize..."

**Testing** (triggers /test-coverage or tdd-guide):
- "Test...", "Coverage...", "Make sure it works..."

### Progress Updates

Progress is reported in plain English:
```
Building your login feature:

[Done] Step 1: Planning what to build
[Done] Step 2: Writing the code
[Working] Step 3: Testing to make sure it works...
[Pending] Step 4: Checking for security
[Pending] Step 5: Preparing for review
```

### When Intent Is Unclear

If your request could mean multiple things, you'll be asked a simple clarifying question:
```
What would you like to do?
1. Build something new (feature)
2. Fix something broken (bug)
3. Improve existing code (refactor)
4. Check code quality (review)
```

---

## Project-Specific Rules

### Common Mistakes to Avoid

**TypeScript:**
- ❌ Don't use `any` type - use `unknown` or create proper types
- ❌ Don't use `as` type assertions unless absolutely necessary
- ❌ Don't ignore TypeScript errors with `// @ts-ignore`
- ✅ Create proper interfaces/types for all data structures

**React:**
- ❌ Don't mutate state directly: `state.push(item)` ❌
- ✅ Use immutable updates: `setState([...state, item])` ✅
- ❌ Don't use index as key in lists: `key={index}` ❌
- ✅ Use stable IDs: `key={item.id}` ✅
- ❌ Don't fetch data in useEffect without cleanup
- ✅ Use React Query or cancel requests in cleanup function

**Database:**
- ❌ Don't use `SELECT *` - specify columns explicitly
- ❌ Don't build SQL with string concatenation (SQL injection risk)
- ✅ Always use parameterized queries or an ORM
- ✅ Add indexes for frequently queried columns

**Async/Await:**
- ❌ Don't forget error handling
  ```typescript
  // Bad
  async function fetchUser() {
    const response = await fetch('/api/user');
    return response.json();
  }

  // Good
  async function fetchUser() {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    } catch (error) {
      logger.error('fetchUser failed', { error });
      throw error;
    }
  }
  ```

### Dependencies & Packages

**Approved:**
- Date handling: `date-fns` (not moment.js - too large)
- HTTP client: `axios` or native `fetch`
- Form validation: `zod` for schemas, `react-hook-form` for forms
- State management: `@reduxjs/toolkit` for global state
- Testing: `vitest` (not jest for new projects)
- Routing: Framework's built-in router (Next.js, React Router)

**Forbidden:**
- `moment.js` - use `date-fns` instead (smaller bundle)
- `lodash` entire library - import specific functions: `lodash.debounce`
- `axios` if project uses native `fetch` - stick to one HTTP client
- Class-based state management libraries (MobX with classes)

**Before Adding Any Package:**
1. Check bundle size on [bundlephobia.com](https://bundlephobia.com)
2. Verify it's actively maintained (recent commits)
3. Check for TypeScript support
4. Ask team in Slack #engineering


### Git & Version Control

**Branch Naming:**
- Features: `feature/user-authentication`
- Bug fixes: `fix/login-error`
- Hotfixes: `hotfix/critical-security-patch`
- Chores: `chore/update-dependencies`

**Commit Messages:**
Follow [Conventional Commits](https://www.conventionalcommits.org):
```
feat: add user registration flow
fix: resolve timezone bug in date picker
docs: update API documentation
refactor: simplify auth middleware
test: add e2e tests for checkout
chore: update dependencies
```

**Pull Request Rules:**
- Max 400 lines changed (excluding generated files)
- Must pass all CI checks (tests, linting, build)
- Requires 1 approval from team member
- Must be up-to-date with base branch
- Delete branch after merge

## Project Context

### Tech Stack

**Example Full-Stack Setup** (Customize for your project):

**Frontend:**
- React 18.2+ with TypeScript 5+
- Next.js 14+ (App Router)
- Tailwind CSS 3+ for styling
- React Hook Form + Zod for forms/validation
- React Query (TanStack Query) for server state
- Redux Toolkit for complex global state

**Backend:**
- Node.js 20+ LTS
- Express 4+ or Fastify 4+
- TypeScript 5+
- Prisma ORM (PostgreSQL)
- JWT for authentication
- Zod for API validation

**Database:**
- PostgreSQL 15+ (primary database)
- Redis 7+ (caching, sessions)

**Testing:**
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- React Testing Library (component tests)

**DevOps:**
- Docker for containerization
- GitHub Actions for CI/CD
- Vercel/Railway/AWS for hosting

### Key Files & Directories

**Frontend Structure:**
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related pages (grouped route)
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard pages
│   └── api/              # API routes
├── components/
│   ├── ui/               # Base UI components (Button, Input, Card)
│   ├── forms/            # Form components (LoginForm, RegisterForm)
│   └── layout/           # Layout components (Header, Footer, Sidebar)
├── features/             # Feature-specific logic
│   ├── auth/            # Authentication feature
│   │   ├── hooks/       # useAuth, useLogin
│   │   ├── api/         # auth API client
│   │   └── types/       # User, Session types
│   └── posts/           # Posts feature
├── lib/                 # Third-party integrations
│   ├── prisma.ts       # Prisma client
│   ├── redis.ts        # Redis client
│   └── stripe.ts       # Stripe SDK
├── hooks/              # Shared custom hooks
├── utils/              # Pure utility functions
└── types/              # Shared TypeScript types
```

**Backend Structure:**
```
src/
├── routes/             # Express routes
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   └── index.ts
├── controllers/        # Route handlers
│   ├── auth.controller.ts
│   └── users.controller.ts
├── services/          # Business logic
│   ├── auth.service.ts
│   ├── email.service.ts
│   └── users.service.ts
├── repositories/      # Database access layer
│   ├── users.repository.ts
│   └── posts.repository.ts
├── middleware/        # Express middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── utils/            # Helper functions
├── types/            # TypeScript types
└── config/           # Configuration
    ├── database.ts
    └── env.ts
```
---
## Error log
- Never pass the model parameter to Task unless:
  1. You explicitly ask me to use a specific model
  2. There's a documented reason to override the agent's configured model 


---

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Maintained By**: Team
