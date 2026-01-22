# Database Patterns

Patterns for database design, optimization, migrations, and data management.

---

## Schema Design

### Normalization Guidelines
| Normal Form | Rule | Example |
|-------------|------|---------|
| 1NF | Atomic values, no repeating groups | Split comma-separated values into rows |
| 2NF | No partial dependencies | Move fields depending only on part of composite key |
| 3NF | No transitive dependencies | Move fields depending on non-key fields |

### Common Patterns

**One-to-Many Relationship**
```sql
-- Parent table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child table with foreign key
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**Many-to-Many Relationship**
```sql
-- Junction/pivot table
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
```

**Self-Referential Relationship**
```sql
-- Hierarchical data (categories, comments, org chart)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  path LTREE -- For efficient hierarchy queries (PostgreSQL)
);

-- Query all descendants
SELECT * FROM categories
WHERE path <@ 'root.electronics.computers';
```

**Polymorphic Association**
```sql
-- Using separate tables (preferred)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_comments (
  comment_id UUID PRIMARY KEY REFERENCES comments(id),
  post_id UUID REFERENCES posts(id)
);

CREATE TABLE product_comments (
  comment_id UUID PRIMARY KEY REFERENCES comments(id),
  product_id UUID REFERENCES products(id)
);
```

---

## Indexing Strategies

### Index Types
```sql
-- B-tree (default): equality and range queries
CREATE INDEX idx_users_email ON users(email);

-- Hash: equality only (faster for exact matches)
CREATE INDEX idx_users_email_hash ON users USING HASH (email);

-- GIN: arrays, JSONB, full-text search
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- GiST: geometric, full-text, ranges
CREATE INDEX idx_locations_coords ON locations USING GIST (coordinates);

-- BRIN: large tables with natural ordering
CREATE INDEX idx_logs_created ON logs USING BRIN (created_at);
```

### Composite Indexes
```sql
-- Order matters! Most selective column first
CREATE INDEX idx_orders_user_status_date
ON orders (user_id, status, created_at DESC);

-- This index helps with:
-- WHERE user_id = ? AND status = ?
-- WHERE user_id = ? AND status = ? AND created_at > ?
-- WHERE user_id = ?
-- NOT: WHERE status = ? (doesn't use leftmost column)
```

### Partial Indexes
```sql
-- Index only rows matching condition
CREATE INDEX idx_active_users
ON users (email)
WHERE status = 'active';

-- Index only non-null values
CREATE INDEX idx_users_phone
ON users (phone)
WHERE phone IS NOT NULL;
```

### Covering Indexes
```sql
-- Include extra columns to avoid table lookups
CREATE INDEX idx_users_email_include
ON users (email)
INCLUDE (name, created_at);

-- Query can be satisfied entirely from index
SELECT name, created_at FROM users WHERE email = 'test@example.com';
```

---

## Query Optimization

### EXPLAIN Analysis
```sql
-- View query plan
EXPLAIN ANALYZE
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id;

-- Key things to look for:
-- - Seq Scan (table scan) on large tables = add index
-- - Nested Loop on large datasets = consider hash/merge join
-- - Sort operations = consider index with ORDER BY columns
-- - High estimated vs actual rows = update statistics
```

### Avoiding N+1 Queries

**Problem**
```typescript
// N+1: 1 query for users + N queries for posts
const users = await db.users.findMany();
for (const user of users) {
  user.posts = await db.posts.findMany({ where: { userId: user.id } });
}
```

**Solution: JOIN or Include**
```typescript
// Single query with JOIN
const users = await db.users.findMany({
  include: { posts: true }
});

// Or explicit JOIN
const usersWithPosts = await db.$queryRaw`
  SELECT u.*, json_agg(p.*) as posts
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  GROUP BY u.id
`;
```

**Solution: Batch Loading**
```typescript
// DataLoader pattern
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.posts.findMany({
    where: { userId: { in: userIds } }
  });

  // Group by userId
  const postsByUser = groupBy(posts, 'userId');
  return userIds.map(id => postsByUser[id] || []);
});

// Usage (batches multiple calls)
const userPosts = await postLoader.load(userId);
```

### Pagination

**Offset Pagination** (simple but slow for large offsets)
```sql
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000;  -- Scans 1020 rows
```

**Cursor Pagination** (efficient for large datasets)
```sql
-- First page
SELECT * FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (using last item's values as cursor)
SELECT * FROM posts
WHERE (created_at, id) < ('2024-01-15T10:00:00Z', 'last-id')
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

```typescript
// TypeScript implementation
async function getPostsCursor(cursor?: string, limit = 20) {
  const decodedCursor = cursor ? decodeCursor(cursor) : null;

  const posts = await db.posts.findMany({
    where: decodedCursor ? {
      OR: [
        { createdAt: { lt: decodedCursor.createdAt } },
        {
          createdAt: decodedCursor.createdAt,
          id: { lt: decodedCursor.id }
        }
      ]
    } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1, // Fetch one extra to check hasMore
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore
    ? encodeCursor({ createdAt: items.at(-1).createdAt, id: items.at(-1).id })
    : null;

  return { items, nextCursor, hasMore };
}
```

---

## Transactions

### ACID Properties
- **Atomicity**: All or nothing
- **Consistency**: Valid state transitions
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists

### Transaction Patterns
```typescript
// Prisma transaction
async function transferFunds(fromId: string, toId: string, amount: number) {
  return db.$transaction(async (tx) => {
    // Deduct from sender
    const sender = await tx.accounts.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });

    if (sender.balance < 0) {
      throw new Error('Insufficient funds');
    }

    // Add to receiver
    await tx.accounts.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });

    // Log transfer
    await tx.transfers.create({
      data: { fromId, toId, amount },
    });
  });
}
```

### Isolation Levels
```sql
-- Read Uncommitted: dirty reads possible
-- Read Committed: no dirty reads (PostgreSQL default)
-- Repeatable Read: no phantom reads
-- Serializable: strictest, may fail under contention

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- Your queries here
COMMIT;
```

---

## Migration Patterns

### Migration Structure
```sql
-- migrations/20240115_001_create_users.sql

-- Up migration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Down migration (rollback)
-- DROP INDEX idx_users_email;
-- DROP TABLE users;
```

### Safe Migration Practices

**Adding Columns**
```sql
-- Safe: nullable column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Safe: column with default (PG 11+, instant)
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Unsafe: NOT NULL without default on existing table
-- ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL; -- Fails!
```

**Adding Indexes Concurrently**
```sql
-- Non-blocking index creation (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_status ON users(status);
```

**Renaming Columns (Zero-Downtime)**
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Copy data (batch if large table)
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Step 3: Update application to use both columns
-- Step 4: Remove old column (after deployment complete)
ALTER TABLE users DROP COLUMN name;
```

### Data Migrations
```typescript
// Batch processing for large tables
async function migrateUserData() {
  let cursor = null;
  const batchSize = 1000;

  do {
    const users = await db.users.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    await db.$transaction(
      users.map(user =>
        db.users.update({
          where: { id: user.id },
          data: { fullName: `${user.firstName} ${user.lastName}` },
        })
      )
    );

    cursor = users.at(-1)?.id;
    console.log(`Migrated ${batchSize} users, cursor: ${cursor}`);
  } while (true);
}
```

---

## Soft Deletes

### Implementation
```sql
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ;

-- "Delete" a post
UPDATE posts SET deleted_at = NOW() WHERE id = ?;

-- Query excludes deleted
SELECT * FROM posts WHERE deleted_at IS NULL;

-- Index for active records
CREATE INDEX idx_posts_active ON posts (id) WHERE deleted_at IS NULL;
```

### Prisma Middleware
```typescript
// Automatically filter soft-deleted records
prisma.$use(async (params, next) => {
  if (params.model === 'Post') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, deletedAt: null };
    }
    if (params.action === 'findMany') {
      params.args.where = { ...params.args.where, deletedAt: null };
    }
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
  }
  return next(params);
});
```

---

## Connection Pooling

### Pool Configuration
```typescript
// Prisma with connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${DATABASE_URL}?connection_limit=20&pool_timeout=30`,
    },
  },
});

// Explicit pool with pg
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

### Pool Sizing
```
Optimal connections ≈ ((core_count * 2) + effective_spindle_count)

For SSD: ~10 connections per core
For cloud (e.g., RDS): Start with max_connections / expected_instances
```

---

## Monitoring Queries

### Slow Query Log (PostgreSQL)
```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
SELECT pg_reload_conf();

-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

### Index Usage
```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey';

-- Find missing indexes (sequential scans on large tables)
SELECT relname, seq_scan, seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_tup_read DESC;
```

---

## Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Use The Index, Luke: https://use-the-index-luke.com/
- Prisma Best Practices: https://www.prisma.io/docs/guides/performance-and-optimization
- Database Normalization: https://www.guru99.com/database-normalization.html
