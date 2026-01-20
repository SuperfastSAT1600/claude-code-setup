# Common Patterns & Conventions

Project-wide patterns that should be followed consistently across all code.

---

## 1. API Response Format

**Rule**: All API endpoints must return consistent response format.

### Success Response:
```typescript
{
  "data": T,  // The actual response data
  "meta"?: {  // Optional metadata
    "timestamp": "2026-01-20T10:00:00Z",
    "version": "1.0",
    "pagination"?: {
      "page": 1,
      "perPage": 20,
      "total": 100
    }
  }
}
```

### Error Response:
```typescript
{
  "error": {
    "code": "ERROR_CODE",       // Machine-readable error code
    "message": "Human message",  // User-friendly message
    "details"?: any              // Optional additional context
  }
}
```

### Examples:

**✅ CORRECT: Success Response**
```typescript
// GET /api/users/123
return res.json({
  data: {
    id: "123",
    name: "Alice",
    email: "alice@example.com"
  },
  meta: {
    timestamp: new Date().toISOString()
  }
});
```

**✅ CORRECT: Error Response**
```typescript
// POST /api/users with invalid data
return res.status(400).json({
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid email format",
    details: {
      field: "email",
      value: "not-an-email"
    }
  }
});
```

**❌ WRONG: Inconsistent Formats**
```typescript
// Different responses across endpoints
return res.json(user);                    // Just data
return res.json({ success: true, user }); // Custom format
return res.json({ result: user });        // Another custom format
```

---

## 2. Database Query Patterns

**Rule**: Use repository pattern. Never raw queries in controllers.

### Repository Pattern:
```typescript
// ✅ CORRECT: Repository encapsulates data access
class UserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    return await this.db.users.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.users.findUnique({ where: { email } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return await this.db.users.create({ data });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return await this.db.users.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.users.delete({ where: { id } });
  }
}

// Controller uses repository
class UserController {
  constructor(private userRepo: UserRepository) {}

  async getUser(req: Request, res: Response) {
    const user = await this.userRepo.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }
    return res.json({ data: user });
  }
}
```

**❌ WRONG: Direct database access in controller**
```typescript
class UserController {
  async getUser(req: Request, res: Response) {
    // Direct DB access - violates separation of concerns
    const user = await db.users.findUnique({ where: { id: req.params.id } });
    return res.json(user);
  }
}
```

---

## 3. Error Handling Pattern

**Rule**: Handle errors at boundaries, propagate with context.

### Error Handling Layers:

**Service Layer: Add Context and Propagate**
```typescript
// ✅ CORRECT: Service adds context
class PaymentService {
  async processPayment(orderId: string, amount: number): Promise<Payment> {
    try {
      return await stripe.charges.create({
        amount: amount * 100,
        currency: 'usd',
        metadata: { orderId }
      });
    } catch (error) {
      throw new PaymentProcessingError(
        `Failed to process payment for order ${orderId}`,
        { cause: error, orderId, amount }
      );
    }
  }
}
```

**Controller Layer: Catch, Log, Return User-Friendly Error**
```typescript
// ✅ CORRECT: Controller handles errors gracefully
app.post('/api/checkout', async (req, res) => {
  try {
    const result = await paymentService.processPayment(
      req.body.orderId,
      req.body.amount
    );
    return res.json({ data: result });
  } catch (error) {
    logger.error('Checkout failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      orderId: req.body.orderId
    });

    if (error instanceof PaymentProcessingError) {
      return res.status(402).json({
        error: {
          code: 'PAYMENT_FAILED',
          message: 'Payment processing failed. Please check your card and try again.'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      }
    });
  }
});
```

**❌ WRONG: Exposing internal errors**
```typescript
app.post('/api/checkout', async (req, res) => {
  try {
    const result = await processPayment(req.body);
    return res.json(result);
  } catch (error) {
    // Exposes internal details to user
    return res.status(500).json({
      error: error.message,  // "Stripe API key invalid"
      stack: error.stack     // Full stack trace
    });
  }
});
```

---

## 4. Configuration Pattern

**Rule**: Use environment-based config with validation.

```typescript
// ✅ CORRECT: Validated configuration
import { z } from 'zod';

const EnvSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),

  // Database
  DATABASE_URL: z.string().url(),

  // External Services
  FIREBASE_API_KEY: z.string().min(10),
  FIREBASE_PROJECT_ID: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),

  // Optional
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  REDIS_URL: z.string().url().optional(),
});

export const env = EnvSchema.parse(process.env);

// Usage
const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

**❌ WRONG: Unvalidated environment variables**
```typescript
// No validation - crashes at runtime if PORT is not a number
const PORT = Number(process.env.PORT);
const API_KEY = process.env.API_KEY; // Might be undefined

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 5. Logging Pattern

**Rule**: Use structured logging with appropriate levels.

### Log Levels:
- **debug**: Detailed debugging information
- **info**: General informational messages
- **warn**: Warning messages (degraded performance, deprecated usage)
- **error**: Error messages (errors that need attention)

```typescript
// ✅ CORRECT: Structured logging
import logger from './logger';

logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date().toISOString()
});

logger.error('Payment failed', {
  orderId,
  userId: user.id,
  amount,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});

logger.warn('API rate limit approaching', {
  userId: user.id,
  requestCount: count,
  limit: RATE_LIMIT,
  timestamp: new Date().toISOString()
});
```

**❌ WRONG: Unstructured logging**
```typescript
console.log('User logged in: ' + user.id);
console.log(error); // No context
console.error('Something went wrong'); // No details
```

### What to Log:
- ✅ User actions (login, logout, critical operations)
- ✅ API requests (endpoint, method, status, duration)
- ✅ Errors with full context
- ✅ Performance metrics
- ✅ Security events (failed auth, suspicious activity)

### What NOT to Log:
- ❌ Passwords
- ❌ API keys
- ❌ Credit card numbers
- ❌ Session tokens
- ❌ Personal identifiable information (PII) unless necessary

---

## 6. Authentication & Authorization Pattern

**Rule**: Separate authentication (who you are) from authorization (what you can do).

### Authentication Middleware:
```typescript
// ✅ CORRECT: Authentication middleware
async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const session = await verifyToken(token);
    req.user = await userRepo.findById(session.userId);

    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid session' }
      });
    }

    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' }
    });
  }
}
```

### Authorization Middleware:
```typescript
// ✅ CORRECT: Authorization middleware
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    next();
  };
}

// Usage
app.delete('/api/users/:id',
  authenticate,
  requirePermission('delete:users'),
  deleteUserHandler
);
```

---

## 7. Input Validation Pattern

**Rule**: Validate all input at API boundaries using schemas.

```typescript
// ✅ CORRECT: Schema-based validation
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(18).max(120).optional(),
  role: z.enum(['user', 'admin', 'moderator']).default('user')
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

app.post('/api/users', async (req, res) => {
  try {
    // Parse and validate in one step
    const data = CreateUserSchema.parse(req.body);

    const user = await userService.create(data);
    return res.status(201).json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors
        }
      });
    }
    throw error;
  }
});
```

**❌ WRONG: No validation**
```typescript
app.post('/api/users', async (req, res) => {
  // No validation - any data structure accepted
  const user = await db.users.create({ data: req.body });
  return res.json(user);
});
```

---

## 8. Pagination Pattern

**Rule**: Implement consistent pagination for list endpoints.

```typescript
// ✅ CORRECT: Standard pagination
const PaginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  perPage: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
});

app.get('/api/users', async (req, res) => {
  const { page, perPage } = PaginationSchema.parse(req.query);

  const skip = (page - 1) * perPage;
  const [users, total] = await Promise.all([
    userRepo.findMany({ skip, take: perPage }),
    userRepo.count()
  ]);

  return res.json({
    data: users,
    meta: {
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    }
  });
});
```

---

## 9. Hook Performance Pattern

**Rule**: Hooks must complete in <100ms to avoid slowdowns.

### Good Hook (Fast):
```json
{
  "when": "PreToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{
    "type": "command",
    "command": "grep -q 'TODO' \"$file_path\" && echo '[Hook] TODO found' >&2 || true"
  }]
}
```

**Why it's fast:**
- Uses `grep -q` (quiet mode, exits on first match)
- `|| true` prevents blocking on no match
- Single file operation
- No network requests

### Bad Hook (Slow):
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{
    "type": "command",
    "command": "npm test && npm run lint && npm audit"
  }]
}
```

**Why it's bad:**
- Runs entire test suite (seconds to minutes)
- Multiple commands chained
- Blocks on failure
- Runs on EVERY edit

### Hook Best Practices:
- ✅ Use `-q` flag for quick checks
- ✅ Exit early with `|| true`
- ✅ Check single files, not projects
- ✅ Avoid network requests
- ✅ Use stderr for warnings (`>&2`)

---

## 10. Async/Await Error Handling

**Rule**: Always handle promise rejections.

```typescript
// ✅ CORRECT: Proper async error handling
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return UserSchema.parse(data); // Validate response
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    throw new UserFetchError(`Failed to fetch user ${userId}`, { cause: error });
  }
}
```

**❌ WRONG: Unhandled promise**
```typescript
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json(); // No error handling
}
```

---

## 11. Testing Patterns

**Rule**: Follow AAA pattern (Arrange, Act, Assert).

```typescript
// ✅ CORRECT: Clear AAA structure
describe('UserService', () => {
  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const input = { email: 'alice@example.com', name: 'Alice' };
      const mockRepo = {
        create: jest.fn().mockResolvedValue({ id: '1', ...input })
      };
      const service = new UserService(mockRepo);

      // Act
      const result = await service.create(input);

      // Assert
      expect(result.id).toBe('1');
      expect(result.email).toBe('alice@example.com');
      expect(mockRepo.create).toHaveBeenCalledWith(input);
    });
  });
});
```

---

## 12. Firebase Integration Pattern

**Rule**: Use Firebase Admin SDK on backend, Firebase Client SDK on frontend.

### Backend (Admin SDK):
```typescript
// ✅ CORRECT: Admin SDK for backend
import admin from 'firebase-admin';

// Initialize once
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

// Usage
async function verifyToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new AuthenticationError('Invalid token', { cause: error });
  }
}
```

### Frontend (Client SDK):
```typescript
// ✅ CORRECT: Client SDK for frontend
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const auth = getAuth(app);

async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error) {
    throw new LoginError('Login failed', { cause: error });
  }
}
```

---

## Pattern Checklist

Code Review Checklist:
- [ ] API responses follow standard format (data/error)
- [ ] Database access uses repository pattern
- [ ] Errors handled at proper boundaries with context
- [ ] Configuration validated with Zod schemas
- [ ] Structured logging used throughout
- [ ] Authentication separated from authorization
- [ ] Input validated with schemas at boundaries
- [ ] Pagination implemented for list endpoints
- [ ] Hooks complete in <100ms
- [ ] Promise rejections handled properly
- [ ] Tests follow AAA pattern
- [ ] Firebase Admin SDK used on backend only

---

## Resources

- Repository Pattern: https://martinfowler.com/eaaCatalog/repository.html
- Error Handling Best Practices: https://nodejs.org/en/docs/guides/error-handling/
- Zod Documentation: https://zod.dev/
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
