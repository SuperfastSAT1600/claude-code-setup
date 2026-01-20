# Backend Patterns

API design, database patterns, caching strategies, and backend architecture.

---

## API Design

### RESTful API Conventions
```
GET    /api/users          # List users
GET    /api/users/:id      # Get user
POST   /api/users          # Create user
PUT    /api/users/:id      # Update user (full)
PATCH  /api/users/:id      # Update user (partial)
DELETE /api/users/:id      # Delete user
```

### Request/Response Format
```typescript
// Request body
POST /api/users
{
  "name": "Alice",
  "email": "alice@example.com"
}

// Success response
HTTP 201 Created
{
  "data": {
    "id": "123",
    "name": "Alice",
    "email": "alice@example.com",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}

// Error response
HTTP 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "fields": {
      "email": "Must be a valid email address"
    }
  }
}
```

### Pagination
```typescript
GET /api/users?page=2&limit=20

{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Filtering & Sorting
```
GET /api/users?status=active&sort=-createdAt&search=alice
```

---

## Database Patterns

### Repository Pattern
```typescript
class UserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.query('SELECT * FROM users WHERE email = $1', [email]);
  }

  async create(user: CreateUserInput): Promise<User> {
    const result = await this.db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [user.name, user.email]
    );
    return result.rows[0];
  }
}
```

### Unit of Work Pattern
```typescript
class UnitOfWork {
  private transactions: Transaction[] = [];

  async execute<T>(work: () => Promise<T>): Promise<T> {
    const transaction = await this.db.beginTransaction();
    try {
      const result = await work();
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

### Query Builder
```typescript
const users = await db
  .select('id', 'name', 'email')
  .from('users')
  .where('status', '=', 'active')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .execute();
```

---

## Caching Strategies

### Cache-Aside (Lazy Loading)
```typescript
async function getUser(id: string): Promise<User> {
  // Check cache first
  const cached = await cache.get(`user:${id}`);
  if (cached) return cached;

  // Cache miss - fetch from database
  const user = await db.users.findById(id);

  // Store in cache
  await cache.set(`user:${id}`, user, { ttl: 3600 });

  return user;
}
```

### Write-Through Cache
```typescript
async function updateUser(id: string, data: Partial<User>): Promise<User> {
  // Update database
  const user = await db.users.update(id, data);

  // Update cache
  await cache.set(`user:${id}`, user, { ttl: 3600 });

  return user;
}
```

### Cache Invalidation
```typescript
async function deleteUser(id: string): Promise<void> {
  await db.users.delete(id);
  await cache.delete(`user:${id}`);
  await cache.delete(`user:${id}:posts`); // Related caches
}
```

---

## Authentication & Authorization

### JWT Authentication
```typescript
function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}
```

### RBAC (Role-Based Access Control)
```typescript
function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user.permissions.includes(permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }

    next();
  };
}

// Usage
app.delete('/api/users/:id',
  requirePermission('users:delete'),
  deleteUserHandler
);
```

---

## Error Handling

### Custom Error Classes
```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(public fields: Record<string, string>) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
  }
}
```

### Global Error Handler
```typescript
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { fields: error.fields })
      }
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', { error, req });

  // Don't expose internal errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

---

## Background Jobs

### Job Queue Pattern
```typescript
interface Job {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
}

class JobQueue {
  async enqueue(type: string, data: any): Promise<Job> {
    const job = {
      id: generateId(),
      type,
      data,
      attempts: 0,
      maxAttempts: 3
    };

    await redis.lpush('jobs', JSON.stringify(job));
    return job;
  }

  async process() {
    while (true) {
      const jobStr = await redis.brpop('jobs', 0);
      const job = JSON.parse(jobStr);

      try {
        await this.handlers[job.type](job.data);
      } catch (error) {
        job.attempts++;
        if (job.attempts < job.maxAttempts) {
          await redis.lpush('jobs', JSON.stringify(job));
        }
      }
    }
  }
}
```

---

## Rate Limiting

### Token Bucket Algorithm
```typescript
class RateLimiter {
  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - window;

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in window
    const count = await redis.zcard(key);

    if (count >= limit) {
      return false;
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(window / 1000));

    return true;
  }
}
```

---

## Microservices Communication

### Event-Driven Architecture
```typescript
interface Event {
  type: string;
  data: any;
  timestamp: number;
}

class EventBus {
  async publish(event: Event): Promise<void> {
    await kafka.send({
      topic: event.type,
      messages: [{ value: JSON.stringify(event) }]
    });
  }

  async subscribe(eventType: string, handler: (event: Event) => void): Promise<void> {
    await kafka.subscribe({ topic: eventType });
    await kafka.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value.toString());
        await handler(event);
      }
    });
  }
}
```

---

## Database Optimization

### Indexing Strategy
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Covering index (includes extra columns)
CREATE INDEX idx_users_lookup ON users(email) INCLUDE (name, created_at);
```

### Query Optimization
```typescript
// ❌ N+1 Query Problem
const users = await db.users.findAll();
for (const user of users) {
  user.posts = await db.posts.findByUserId(user.id);
}

// ✅ Use JOIN or batch query
const users = await db.query(`
  SELECT u.*, json_agg(p.*) as posts
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  GROUP BY u.id
`);
```

---

## Resources

- REST API Design: https://restfulapi.net/
- Database Patterns: Martin Fowler's PoEAA
- Microservices: https://microservices.io/patterns/
