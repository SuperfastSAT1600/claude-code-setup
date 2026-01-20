# Team Claude Code Guidelines

This file contains guidelines and learnings for Claude Code to prevent repeated mistakes and maintain consistency across the team.

## Purpose

This is our team's shared knowledge base for Claude Code. When Claude makes a mistake or does something incorrectly, we add it here so it learns from our specific project needs and doesn't repeat the same errors.

## How to Use This File

1. **During Development**: When Claude does something wrong, immediately add a note here
2. **During Code Review**: Tag `@.claude` in PRs to suggest additions to this file
3. **Weekly Updates**: Team members should review and update this file regularly
4. **Keep it Current**: Remove outdated rules as the project evolves

## Project-Specific Rules

### Code Style & Formatting

**TypeScript/JavaScript:**
- Always use `const` for variables that don't change, `let` for mutable variables
- Prefer template literals over string concatenation: `` `Hello ${name}` `` not `'Hello ' + name`
- Use optional chaining: `user?.profile?.name` instead of `user && user.profile && user.profile.name`
- Prefer nullish coalescing: `port ?? 3000` instead of `port || 3000`
- Use destructuring: `const { id, name } = user` instead of multiple assignments

**React:**
- Always use functional components with hooks, never class components
- Custom hooks must start with `use`: `useAuth`, `useFormValidation`
- Props interfaces should end with `Props`: `ButtonProps`, `CardProps`
- Event handlers should start with `handle`: `handleClick`, `handleSubmit`

**Python:**
- Follow PEP 8: snake_case for functions/variables, PascalCase for classes
- Use type hints: `def process_user(user_id: str) -> User:`
- Prefer f-strings: `f"Hello {name}"` not `"Hello " + name`
- Use dataclasses for simple data structures instead of dictionaries

### Architecture Guidelines

**API Layer:**
- All external API calls must go through the `services/` directory
- Use repository pattern for database access - never raw queries in controllers
- API responses must follow standard format:
  ```typescript
  { data: T, meta?: { pagination, etc } } // Success
  { error: { code: string, message: string } } // Error
  ```

**State Management:**
- Global app state: Use Redux Toolkit (not legacy Redux)
- Server state: Use React Query or SWR (for data fetching)
- Form state: Use React Hook Form (not Formik)
- URL state: Use router's query params

**File Structure:**
```
src/
├── components/       # Reusable UI components (Button, Card, etc)
├── features/         # Feature-specific components and logic
├── services/         # API clients, external services
├── hooks/           # Custom React hooks
├── utils/           # Pure utility functions
├── types/           # TypeScript type definitions
└── pages/           # Route components (Next.js) or views
```

**Imports:**
- Use path aliases: `@/components/Button` not `../../../components/Button`
- Order: React → external libraries → internal modules → types → styles
- Group imports with blank lines between categories

### Testing Requirements

**Coverage Targets:**
- Business logic: 90%+ coverage
- API endpoints: 85%+ coverage
- React components: 70%+ coverage
- Utility functions: 95%+ coverage

**Test Naming:**
- Use descriptive names: `it('should reject invalid email format')` not `it('test email')`
- Follow AAA pattern: Arrange, Act, Assert
- One assertion per test when possible

**What to Test:**
```typescript
// ✅ DO: Test behavior and outcomes
it('should display error when email is invalid', () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(screen.getByText('Invalid email format')).toBeInTheDocument();
});

// ❌ DON'T: Test implementation details
it('should call setError when email is invalid', () => {
  // Testing internal state changes
});
```

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

### Security Guidelines

**Never Commit:**
- API keys, tokens, passwords
- `.env` files (use `.env.example` as template)
- Private keys, certificates
- Customer data or PII

**Input Validation:**
- Always validate user input on both client AND server
- Use schema validation libraries: `zod`, `yup`
- Sanitize HTML before rendering: use `DOMPurify`
- Validate file uploads: check type, size, scan for malware

**Authentication:**
- Store tokens in httpOnly cookies (not localStorage - XSS risk)
- Implement CSRF protection for state-changing requests
- Use bcrypt or argon2 for password hashing (min 10 rounds)
- Implement rate limiting on login endpoints

**Example:**
```typescript
// ✅ Good: Validated and sanitized
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
});

async function createUser(input: unknown) {
  const data = UserSchema.parse(input); // Throws if invalid
  // Now data is typed and validated
}

// ❌ Bad: No validation
async function createUser(input: any) {
  await db.users.create(input); // SQL injection risk
}
```

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

**Important Files:**
- `prisma/schema.prisma` - Database schema (DO NOT edit directly - use migrations)
- `.env.example` - Environment variable template (safe to commit)
- `.env` - Actual secrets (NEVER commit - already in .gitignore)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `docker-compose.yml` - Local development services

### External Services

**Production Services:**
- **AWS S3**: File/image storage (use pre-signed URLs for uploads)
- **Stripe**: Payment processing (live keys in production only)
- **SendGrid**: Transactional emails (verify sandbox mode in dev)
- **Cloudflare**: CDN and DDoS protection
- **Sentry**: Error tracking and monitoring

**Development/Testing:**
- **Mailtrap**: Email testing (catches all emails in dev)
- **Stripe Test Mode**: Use test credit cards only
- **LocalStack**: Mock AWS services locally (optional)

**Configuration:**
```typescript
// config/services.ts
export const services = {
  stripe: {
    apiKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET!,
    region: process.env.AWS_REGION!,
  },
  email: {
    apiKey: process.env.SENDGRID_API_KEY!,
    from: 'noreply@example.com',
  },
};
```

## Team Conventions

### Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (UserProfile.tsx)
- Utilities: `camelCase.ts` (formatDate.ts)
- Types: `PascalCase.ts` or `camelCase.types.ts`
- Tests: `*.test.ts` or `*.spec.ts`
- Constants: `SCREAMING_SNAKE_CASE.ts` (API_ENDPOINTS.ts)

**Code:**
- React components: `PascalCase` (UserProfile)
- Hooks: `useCamelCase` (useAuth, useFormValidation)
- Functions: `camelCase` (getUserById, formatCurrency)
- Constants: `SCREAMING_SNAKE_CASE` (MAX_UPLOAD_SIZE)
- Types/Interfaces: `PascalCase` (User, UserProfile, ButtonProps)
- Enums: `PascalCase` with `PascalCase` values (UserRole.Admin)

**Database:**
- Tables: `snake_case` plural (users, blog_posts, user_sessions)
- Columns: `snake_case` (first_name, created_at, user_id)
- Indexes: `idx_table_column` (idx_users_email)
- Constraints: `table_column_constraint` (users_email_unique)

### File Organization

**Component Structure:**
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded font-medium',
          {
            'bg-blue-500 text-white': variant === 'primary',
            'bg-gray-200 text-gray-800': variant === 'secondary',
            'bg-red-500 text-white': variant === 'danger',
            'px-2 py-1 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**Test Structure:**
```typescript
// components/ui/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should apply primary variant styles by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });

  it('should apply danger variant styles when specified', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });
});
```

**API Route Structure:**
```typescript
// app/api/users/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const data = CreateUserSchema.parse(body);

    // Business logic
    const user = await createUser(data);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors } },
        { status: 400 }
      );
    }

    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' } },
      { status: 500 }
    );
  }
}
```

## Resources

- Project Documentation: [Add link]
- API Documentation: [Add link]
- Design System: [Add link]

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Maintained By**: Team
