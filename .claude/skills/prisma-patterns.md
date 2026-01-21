# Prisma Patterns

Best practices for using Prisma ORM effectively.

---

## Schema Design

### Basic Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model with common patterns
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String
  role          UserRole  @default(USER)
  emailVerified DateTime? @map("email_verified")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at") // Soft delete

  // Relations
  profile   Profile?
  posts     Post[]
  comments  Comment[]
  sessions  Session[]

  @@index([email])
  @@index([createdAt])
  @@map("users")
}

model Profile {
  id        String  @id @default(uuid())
  userId    String  @unique @map("user_id")
  bio       String?
  avatarUrl String? @map("avatar_url")
  website   String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id          String     @id @default(uuid())
  authorId    String     @map("author_id")
  title       String
  slug        String     @unique
  content     String
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?  @map("published_at")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags     Tag[]
  comments Comment[]

  @@index([authorId])
  @@index([status, publishedAt(sort: Desc)])
  @@map("posts")
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique
  posts Post[]

  @@map("tags")
}

model Comment {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  authorId  String   @map("author_id")
  parentId  String?  @map("parent_id")
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author  User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@index([postId, createdAt(sort: Desc)])
  @@map("comments")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

---

## Client Setup

### Singleton Pattern
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Extended Client with Middleware
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
    ],
  });

  // Soft delete middleware
  client.$use(async (params, next) => {
    if (params.model === 'User') {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
      if (params.action === 'findMany' || params.action === 'findFirst') {
        params.args['where'] = {
          ...params.args['where'],
          deletedAt: null,
        };
      }
    }
    return next(params);
  });

  // Query timing middleware
  client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    if (duration > 100) {
      console.warn(`Slow query (${duration}ms): ${params.model}.${params.action}`);
    }

    return result;
  });

  return client;
}

export const prisma = createPrismaClient();
```

---

## Query Patterns

### Basic CRUD
```typescript
// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: hashedPassword,
    profile: {
      create: {
        bio: 'Hello world',
      },
    },
  },
  include: {
    profile: true,
  },
});

// Read
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    posts: {
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    },
  },
});

// Update
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    name: 'Jane Doe',
    profile: {
      update: {
        bio: 'Updated bio',
      },
    },
  },
});

// Delete
await prisma.user.delete({
  where: { id: userId },
});
```

### Filtering
```typescript
// Complex filtering
const users = await prisma.user.findMany({
  where: {
    AND: [
      { role: 'USER' },
      { emailVerified: { not: null } },
      {
        OR: [
          { email: { contains: '@company.com' } },
          { name: { startsWith: 'John' } },
        ],
      },
    ],
  },
});

// Filter by relation
const usersWithPosts = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        status: 'PUBLISHED',
      },
    },
  },
});

// Full-text search (PostgreSQL)
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { search: 'typescript' } },
      { content: { search: 'typescript' } },
    ],
  },
});
```

### Pagination
```typescript
// Offset-based pagination
async function getPaginatedUsers(page: number, perPage: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

// Cursor-based pagination
async function getCursorPaginatedUsers(cursor?: string, limit = 20) {
  const users = await prisma.user.findMany({
    take: limit + 1, // Fetch one extra to check if there are more
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor
    }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = users.length > limit;
  const items = hasMore ? users.slice(0, -1) : users;

  return {
    data: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore,
  };
}
```

---

## Transactions

### Sequential Transactions
```typescript
// Implicit transaction (all or nothing)
const [user, post] = await prisma.$transaction([
  prisma.user.create({
    data: { email: 'user@example.com', name: 'John' },
  }),
  prisma.post.create({
    data: { title: 'First Post', content: '...', authorId: 'temp' },
  }),
]);

// Interactive transaction
const result = await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: { email: 'user@example.com', name: 'John' },
  });

  // Create post with user ID
  const post = await tx.post.create({
    data: {
      title: 'First Post',
      content: '...',
      authorId: user.id,
      slug: generateSlug('First Post'),
    },
  });

  // Update user post count (if denormalized)
  await tx.user.update({
    where: { id: user.id },
    data: { postCount: { increment: 1 } },
  });

  return { user, post };
});
```

### Transaction with Rollback
```typescript
async function createOrder(data: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    // Check inventory
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.stock < data.quantity) {
      throw new Error('Insufficient inventory');
    }

    // Create order
    const order = await tx.order.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        quantity: data.quantity,
        total: product.price * data.quantity,
      },
    });

    // Decrement inventory
    await tx.product.update({
      where: { id: data.productId },
      data: { stock: { decrement: data.quantity } },
    });

    return order;
  });
}
```

---

## Migrations

### Creating Migrations
```bash
# Create migration from schema changes
npx prisma migrate dev --name add_user_profile

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Safe Migration Patterns
```sql
-- Adding a column (safe)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Adding index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);

-- Renaming column (requires multiple steps)
-- 1. Add new column
-- 2. Copy data
-- 3. Update application to use both
-- 4. Drop old column
```

### Data Migration
```typescript
// prisma/migrations/20240115_migrate_data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Migrate data in batches
  const batchSize = 1000;
  let processed = 0;

  while (true) {
    const users = await prisma.user.findMany({
      where: { newField: null },
      take: batchSize,
    });

    if (users.length === 0) break;

    await Promise.all(
      users.map(user =>
        prisma.user.update({
          where: { id: user.id },
          data: { newField: transformOldField(user.oldField) },
        })
      )
    );

    processed += users.length;
    console.log(`Processed ${processed} users`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Performance Optimization

### Select Only Needed Fields
```typescript
// ❌ Fetches all fields
const users = await prisma.user.findMany();

// ✅ Fetches only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

### Avoid N+1 Queries
```typescript
// ❌ N+1 problem
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
  });
}

// ✅ Include relation
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
});
```

### Batch Operations
```typescript
// Create many
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});

// Update many
await prisma.post.updateMany({
  where: { status: 'DRAFT', createdAt: { lt: oneMonthAgo } },
  data: { status: 'ARCHIVED' },
});

// Delete many
await prisma.session.deleteMany({
  where: { expiresAt: { lt: new Date() } },
});
```

### Raw Queries (When Needed)
```typescript
// Raw query for complex operations
const result = await prisma.$queryRaw<User[]>`
  SELECT u.*, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON p.author_id = u.id
  WHERE u.deleted_at IS NULL
  GROUP BY u.id
  HAVING COUNT(p.id) > 5
  ORDER BY post_count DESC
  LIMIT 10
`;

// Raw execute for bulk operations
await prisma.$executeRaw`
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = ${postId}
`;
```

---

## Testing

### Test Setup
```typescript
// tests/helpers/prisma.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

export async function setupTestDatabase() {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  });
}

export async function cleanupTestDatabase() {
  const tables = await testPrisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await testPrisma.$executeRawUnsafe(`TRUNCATE "${tablename}" CASCADE`);
    }
  }
}

export { testPrisma };
```

### Integration Test
```typescript
import { testPrisma, cleanupTestDatabase } from './helpers/prisma';
import { UserService } from '../src/services/userService';

describe('UserService', () => {
  const userService = new UserService(testPrisma);

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  it('creates user with profile', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    expect(user.email).toBe('test@example.com');

    const dbUser = await testPrisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    expect(dbUser).toBeTruthy();
  });
});
```

---

## Best Practices Summary

1. **Use singleton** for Prisma client
2. **Include only needed fields** with `select`
3. **Avoid N+1** with `include` or batch queries
4. **Use transactions** for multi-step operations
5. **Soft delete** with middleware when needed
6. **Index frequently queried** columns
7. **Use cursor pagination** for large datasets
8. **Test with isolated database**
