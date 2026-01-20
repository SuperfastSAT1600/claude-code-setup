# Project Guidelines Template

Template for creating project-specific development guidelines. Copy and customize for each project.

---

## EXAMPLE: Real Project Guidelines (Next.js + Firebase)

Below is a complete example from a production Next.js + Firebase project. Use this as a reference when creating your own project guidelines.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5
- **Backend**: Firebase (Auth + Firestore + Storage + Functions)
- **Styling**: TailwindCSS 3 + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State**: React Query (server state) + Zustand (client state)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel (frontend) + Firebase (backend)

### Project-Specific Patterns

#### Authentication with Firebase
All authentication uses Firebase Auth. Never roll your own auth logic.

```typescript
// app/lib/firebase.ts - Client SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
});

export const auth = getAuth(app);

// app/lib/firebase-admin.ts - Admin SDK (backend only)
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    })
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
```

#### API Routes Pattern
All API routes live in `app/api/` and follow this structure:

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// 1. Define schema
const CreateProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 2. Verify authentication
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing auth token' } },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 3. Parse and validate body
    const body = await request.json();
    const data = CreateProjectSchema.parse(body);

    // 4. Business logic
    const projectRef = await adminDb.collection('projects').add({
      ...data,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const project = await projectRef.get();

    // 5. Return standard format
    return NextResponse.json(
      { data: { id: projectRef.id, ...project.data() } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors } },
        { status: 400 }
      );
    }

    console.error('Create project failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}
```

#### Firestore Query Patterns
Use custom hooks to encapsulate Firestore queries:

```typescript
// app/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function useProjects() {
  return useQuery({
    queryKey: ['projects', auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) throw new Error('Not authenticated');

      const q = query(
        collection(db, 'projects'),
        where('userId', '==', auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!auth.currentUser,
  });
}
```

#### File Organization
```
app/
├── (auth)/                 # Auth-related pages (grouped route)
│   ├── login/
│   ├── register/
│   └── layout.tsx         # Auth-specific layout
├── (dashboard)/           # Dashboard pages (grouped route)
│   ├── projects/
│   ├── settings/
│   └── layout.tsx         # Dashboard layout with sidebar
├── api/                   # API routes
│   ├── projects/
│   └── users/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Auth state hook
│   ├── useProjects.ts    # Projects query hook
│   └── useFirestore.ts   # Generic Firestore hook
├── lib/
│   ├── firebase.ts       # Firebase client SDK
│   ├── firebase-admin.ts # Firebase Admin SDK
│   └── utils.ts          # Utility functions
└── types/
    ├── project.ts        # Project types
    └── user.ts           # User types
```

#### Common Mistakes in THIS Project

**❌ Mistake 1: Using Admin SDK on Client**
```typescript
// WRONG: Admin SDK in client component
import admin from 'firebase-admin';

export default function ClientComponent() {
  admin.firestore().collection('users').get(); // ❌ Breaks app
}
```

**✅ Correct: Use Client SDK**
```typescript
// CORRECT: Client SDK in client component
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ClientComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snapshot => {
      setUsers(snapshot.docs.map(doc => doc.data()));
    });
  }, []);
}
```

**❌ Mistake 2: Not Using React Query for Firestore**
```typescript
// WRONG: Manual state management
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/projects')
    .then(res => res.json())
    .then(data => setProjects(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, []);
```

**✅ Correct: Use React Query**
```typescript
// CORRECT: React Query handles caching, loading, errors
const { data: projects, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: async () => {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }
});
```

**❌ Mistake 3: Direct Firestore Access in Components**
```typescript
// WRONG: Direct Firestore access scattered across components
function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getDocs(collection(db, 'projects')).then(snapshot => {
      setProjects(snapshot.docs.map(doc => doc.data()));
    });
  }, []);
}
```

**✅ Correct: Centralized in Custom Hook**
```typescript
// CORRECT: Custom hook encapsulates query logic
function ProjectList() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <Spinner />;
  return <div>{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}
```

#### Security Rules (Firestore)
Our Firestore security rules are in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects: users can only access their own projects
    match /projects/{projectId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Testing Pattern
```typescript
// __tests__/api/projects.test.ts
import { POST } from '@/app/api/projects/route';
import { adminAuth } from '@/lib/firebase-admin';

jest.mock('@/lib/firebase-admin');

describe('POST /api/projects', () => {
  it('should create project for authenticated user', async () => {
    // Arrange
    const mockToken = 'valid-token';
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'user-123' });

    const request = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { authorization: `Bearer ${mockToken}` },
      body: JSON.stringify({ name: 'Test Project' })
    });

    // Act
    const response = await POST(request as any);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.data.name).toBe('Test Project');
  });
});
```

---

## Template Sections (Customize for Your Project)

---

## Purpose

This file contains project-specific patterns, conventions, and guidelines that complement the general rules. Use this to capture:
- Project-specific architectural decisions
- Domain-specific patterns
- Team agreements
- Technology-specific conventions
- Common pitfalls in THIS project

---

## Project Information

### Tech Stack
- **Frontend**: [e.g., React 18, TypeScript, Tailwind CSS]
- **Backend**: [e.g., Node.js, Express, PostgreSQL]
- **Infrastructure**: [e.g., AWS, Docker, Kubernetes]
- **Testing**: [e.g., Jest, Playwright, Cypress]
- **Build Tools**: [e.g., Vite, esbuild, Turbo]

### Key Dependencies
- [Package name]: [Version] - [Purpose]
- [Package name]: [Version] - [Purpose]

---

## Architecture Overview

### System Design
[Describe high-level architecture]
- Monolith / Microservices / Monorepo?
- Frontend/Backend separation?
- Database architecture?
- Caching strategy?
- Authentication approach?

### Directory Structure
```
src/
├── components/       # Reusable UI components
├── pages/           # Route components
├── services/        # Business logic
├── api/            # API routes
├── db/             # Database queries
├── utils/          # Helper functions
└── types/          # TypeScript types
```

---

## Project-Specific Patterns

### API Response Format
[Define standard response structure]
```typescript
// Success
{
  "data": { ... },
  "meta": { ... }
}

// Error
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Error Handling
[Define how errors are handled]
```typescript
// Example
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new AppError('User-friendly message');
}
```

### State Management
[Define state management approach]
- Global state: [Redux / Zustand / Context]
- Server state: [React Query / SWR]
- Form state: [React Hook Form / Formik]

---

## Domain-Specific Rules

### Business Logic
[Project-specific business rules]
- User roles and permissions
- Pricing calculations
- Workflow states
- Validation rules

### Data Models
[Key domain objects and their relationships]
```typescript
// Example
interface User {
  id: string;
  role: 'admin' | 'user' | 'guest';
  permissions: Permission[];
}

interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed';
}
```

---

## Common Patterns

### Authentication
[How auth is handled in this project]
```typescript
// Example
function useAuth() {
  // Project-specific auth hook
}
```

### Database Queries
[Query patterns for this project]
```typescript
// Example
async function findUserWithOrders(userId: string) {
  return db.users.findUnique({
    where: { id: userId },
    include: { orders: true }
  });
}
```

### File Uploads
[How file uploads are handled]

### Background Jobs
[How async work is processed]

---

## Technology-Specific Guidelines

### React Patterns
[Project-specific React conventions]
- Component organization
- Props naming
- Hook usage
- Context usage

### Database Patterns
[Project-specific DB conventions]
- Migration strategy
- Indexing guidelines
- Query optimization rules

### API Patterns
[Project-specific API conventions]
- Endpoint naming
- Versioning strategy
- Rate limiting rules

---

## Common Mistakes to Avoid

### [Mistake Category]
**Problem**: [Describe what people keep doing wrong]
**Why it's wrong**: [Explain the issue]
**Correct approach**: [Show the right way]

**Example**:
```typescript
// ❌ Wrong
[bad example]

// ✅ Correct
[good example]
```

---

## Testing Strategy

### Test Coverage Requirements
- Business logic: [e.g., 90%]
- API endpoints: [e.g., 85%]
- UI components: [e.g., 70%]

### Test Organization
[Where tests live, naming conventions]
```
__tests__/
  unit/
  integration/
  e2e/
```

### Mocking Strategy
[What to mock, what not to mock]

---

## Security Considerations

### Project-Specific Security Rules
- [e.g., All payments must use Stripe]
- [e.g., User data must be encrypted at rest]
- [e.g., API keys stored in Vault]

### Sensitive Data Handling
[How to handle PII, secrets, etc. in this project]

---

## Performance Requirements

### Targets
- Page load: [e.g., < 2s]
- API response: [e.g., < 200ms p95]
- Database queries: [e.g., < 50ms]

### Optimization Strategies
[Project-specific performance patterns]

---

## Deployment

### Environments
- **Development**: [URL, purpose]
- **Staging**: [URL, purpose]
- **Production**: [URL, purpose]

### Deployment Process
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Rollback Procedure
[How to rollback if deployment fails]

---

## Monitoring & Logging

### Key Metrics
- [Metric 1]
- [Metric 2]
- [Metric 3]

### Logging Standards
[What to log, how to log it]
```typescript
// Example
logger.info('User action', {
  userId,
  action: 'purchase',
  orderId
});
```

### Alerting Rules
[When to alert, who gets alerted]

---

## Third-Party Services

### [Service Name]
- **Purpose**: [What it's used for]
- **Documentation**: [Link]
- **API Keys**: [Where stored]
- **Rate Limits**: [Limits to be aware of]

---

## Team Conventions

### Code Review Checklist
- [ ] [Project-specific item]
- [ ] [Project-specific item]
- [ ] [Project-specific item]

### PR Size Guidelines
- Ideal: [e.g., < 300 lines]
- Maximum: [e.g., < 800 lines]

### Branch Naming
[Project-specific branch naming rules]

---

## Resources

### Internal Documentation
- [Architecture Docs]: [Link]
- [API Docs]: [Link]
- [Database Schema]: [Link]
- [Design System]: [Link]

### External Resources
- [Service 1 Docs]: [Link]
- [Library Docs]: [Link]

---

## Onboarding Checklist

For new team members:
- [ ] Read this document
- [ ] Review architecture docs
- [ ] Set up local environment
- [ ] Deploy to staging
- [ ] Complete starter issue
- [ ] Pair with team member
- [ ] Review recent PRs
- [ ] Understand deployment process

---

## Maintenance

### Updating This Document
- Update when patterns change
- Add new mistakes as they're discovered
- Remove outdated information
- Review monthly in team meetings

### Last Updated
- **Date**: [YYYY-MM-DD]
- **By**: [Team member]
- **Changes**: [What was updated]

---

## Notes

[Any additional project-specific information that doesn't fit elsewhere]
