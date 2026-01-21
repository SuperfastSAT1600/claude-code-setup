# Next.js Patterns

Comprehensive guide to Next.js App Router patterns and best practices.

---

## App Router Structure

### Directory Organization
```
app/
├── (auth)/                    # Route group (no URL impact)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/               # Another route group
│   ├── layout.tsx            # Shared dashboard layout
│   ├── page.tsx              # /dashboard
│   └── settings/
│       └── page.tsx          # /settings
├── api/                       # API routes
│   └── users/
│       ├── route.ts          # /api/users
│       └── [id]/
│           └── route.ts      # /api/users/[id]
├── users/
│   ├── page.tsx              # /users
│   └── [id]/
│       ├── page.tsx          # /users/[id]
│       └── loading.tsx       # Loading UI
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
├── loading.tsx               # Global loading
├── error.tsx                 # Global error
├── not-found.tsx             # 404 page
└── globals.css
```

---

## Server Components

### Default: Server Components
```tsx
// app/users/page.tsx - Server Component by default
import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  // Direct database access (no API needed)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Client Components
```tsx
// app/components/Counter.tsx
'use client'; // Required for client components

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Mixing Server and Client
```tsx
// Server Component (parent)
import { prisma } from '@/lib/prisma';
import { UserList } from './UserList'; // Client component

export default async function UsersPage() {
  const users = await prisma.user.findMany();

  // Pass server data to client component
  return <UserList initialUsers={users} />;
}

// Client Component (child)
'use client';

import { useState } from 'react';

export function UserList({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search users..."
      />
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Data Fetching

### Server-Side Fetching
```tsx
// Fetch in Server Component
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{/* render data */}</div>;
}
```

### Caching Strategies
```tsx
// Force cache (default)
fetch(url, { cache: 'force-cache' });

// No cache (always fresh)
fetch(url, { cache: 'no-store' });

// Time-based revalidation
fetch(url, { next: { revalidate: 60 } }); // Revalidate every 60 seconds

// Tag-based revalidation
fetch(url, { next: { tags: ['users'] } });

// Revalidate by tag (in Server Action)
import { revalidateTag } from 'next/cache';
revalidateTag('users');
```

### Parallel Data Fetching
```tsx
export default async function Page() {
  // Fetch in parallel
  const [users, posts, comments] = await Promise.all([
    getUsers(),
    getPosts(),
    getComments(),
  ]);

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  );
}
```

---

## Server Actions

### Form Actions
```tsx
// app/actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await prisma.user.create({
    data: validatedFields.data,
  });

  revalidatePath('/users');
  redirect('/users');
}

// app/users/new/page.tsx
import { createUser } from '@/app/actions/user';

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

### Server Actions with useFormState
```tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createUser } from '@/app/actions/user';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create User'}
    </button>
  );
}

export function CreateUserForm() {
  const [state, formAction] = useFormState(createUser, { errors: {} });

  return (
    <form action={formAction}>
      <input name="name" placeholder="Name" />
      {state.errors?.name && <span>{state.errors.name}</span>}

      <input name="email" type="email" placeholder="Email" />
      {state.errors?.email && <span>{state.errors.email}</span>}

      <SubmitButton />
    </form>
  );
}
```

---

## API Routes

### Route Handlers
```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/users
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '20');

  const users = await prisma.user.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.user.count();

  return NextResponse.json({
    data: users,
    meta: {
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    },
  });
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = CreateUserSchema.parse(body);

    const user = await prisma.user.create({
      data: validated,
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### Dynamic Route Handlers
```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: { id: string };
}

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: user });
}

// PATCH /api/users/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const body = await request.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ data: user });
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  await prisma.user.delete({
    where: { id: params.id },
  });

  return new NextResponse(null, { status: 204 });
}
```

---

## Middleware

### Authentication Middleware
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  if (request.nextUrl.pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get('session')?.value;

  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user = await verifyToken(token);

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

---

## Layouts

### Root Layout
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'My application description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Nested Layouts
```tsx
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## Loading and Error States

### Loading UI
```tsx
// app/users/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
```

### Error Handling
```tsx
// app/users/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found
```tsx
// app/users/[id]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>User Not Found</h2>
      <p>Could not find the requested user.</p>
      <Link href="/users">Back to Users</Link>
    </div>
  );
}

// In page.tsx
import { notFound } from 'next/navigation';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  if (!user) {
    notFound();
  }

  return <div>{user.name}</div>;
}
```

---

## Metadata

### Static Metadata
```tsx
// app/page.tsx
export const metadata = {
  title: 'Home Page',
  description: 'Welcome to my website',
  openGraph: {
    title: 'Home Page',
    description: 'Welcome to my website',
    images: ['/og-image.jpg'],
  },
};
```

### Dynamic Metadata
```tsx
// app/users/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.id);

  return {
    title: user.name,
    description: `Profile page for ${user.name}`,
  };
}
```

---

## Best Practices Summary

1. **Use Server Components** by default
2. **Add 'use client'** only when needed (interactivity, hooks)
3. **Colocate data fetching** with components
4. **Use Server Actions** for mutations
5. **Implement proper loading/error states**
6. **Use middleware** for auth/redirects
7. **Leverage caching** strategies appropriately
