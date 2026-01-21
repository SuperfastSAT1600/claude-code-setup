# Error Handling Rules

Consistent error handling patterns across the application.

---

## 1. Error Class Hierarchy

**Rule**: Use typed error classes, not generic Error.

### Error Class Structure:
```typescript
// Base application error
class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}
```

---

## 2. Error Handling Layers

**Rule**: Handle errors at the appropriate layer.

### Layer Responsibilities:

**Repository Layer**: Database errors → Domain errors
```typescript
class UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      return await this.db.user.findUnique({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Not found is expected
      }
      throw new DatabaseError('Failed to fetch user', { cause: error });
    }
  }

  async create(data: CreateUserInput): Promise<User> {
    try {
      return await this.db.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('User with this email already exists');
      }
      throw new DatabaseError('Failed to create user', { cause: error });
    }
  }
}
```

**Service Layer**: Business logic errors
```typescript
class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    // Validation
    const validation = validateUserInput(input);
    if (!validation.success) {
      throw new ValidationError('Invalid user data', validation.errors);
    }

    // Business rules
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    return this.userRepo.create(input);
  }
}
```

**Controller Layer**: Format and send responses
```typescript
class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error); // Pass to error middleware
    }
  }
}
```

**Error Middleware**: Final error handling
```typescript
function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Request failed', {
    error: error.message,
    stack: error.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle validation errors (e.g., from Zod)
  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: error.errors,
      },
    });
  }

  // Unknown errors - don't expose details
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.id,
    },
  });
}
```

---

## 3. Never Expose Internal Errors

**Rule**: User-facing errors must be safe. Log details internally.

### Correct:
```typescript
// Internal logging
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  connectionString: maskConnectionString(url),
  timestamp: new Date().toISOString(),
});

// User response
res.status(500).json({
  error: {
    code: 'INTERNAL_ERROR',
    message: 'Service temporarily unavailable',
    requestId: req.id,
  },
});
```

### Incorrect:
```typescript
// ❌ Never send this to users
res.status(500).json({
  error: error.message, // May contain DB schema info
  stack: error.stack,   // Exposes file paths
  query: rawSqlQuery,   // SQL injection info
});
```

---

## 4. Async Error Handling

**Rule**: Always handle promise rejections.

### Express Route Handlers:
```typescript
// Option 1: Try-catch
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

// Option 2: Wrapper function
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  res.json({ data: user });
}));
```

### Promise Chains:
```typescript
// ✅ Correct: Catch at the end
fetchUser(id)
  .then(processUser)
  .then(saveUser)
  .catch(handleError);

// ✅ Correct: Individual catch with rethrow
fetchUser(id)
  .catch(error => {
    logger.error('Failed to fetch user', { error });
    throw new NotFoundError('User', id);
  })
  .then(processUser);
```

---

## 5. Error Recovery Patterns

**Rule**: Implement appropriate recovery strategies.

### Retry with Backoff:
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delay?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const backoff = delay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${backoff}ms`);
      await sleep(backoff);
    }
  }

  throw new Error('Unreachable');
}

// Usage
const result = await withRetry(() => fetchExternalAPI(), {
  maxAttempts: 3,
  delay: 1000,
});
```

### Circuit Breaker:
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new ServiceUnavailableError('Service circuit open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = new Date();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

---

## 6. Validation Errors

**Rule**: Return detailed, actionable validation errors.

### Correct:
```typescript
// Using Zod
const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

try {
  UserSchema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    throw new ValidationError('Invalid user data', {
      fields: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
}

// Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid user data",
    "details": {
      "fields": [
        { "field": "email", "message": "Invalid email format" },
        { "field": "password", "message": "Password must be at least 8 characters" }
      ]
    }
  }
}
```

---

## 7. Error Logging

**Rule**: Log all errors with context.

### Structured Logging:
```typescript
logger.error('Operation failed', {
  // Error details
  error: error.message,
  errorCode: error.code,
  stack: error.stack,

  // Request context
  requestId: req.id,
  method: req.method,
  path: req.path,
  userId: req.user?.id,

  // Operation context
  operation: 'createUser',
  input: sanitize(input), // Remove sensitive data

  // Timing
  timestamp: new Date().toISOString(),
  duration: Date.now() - startTime,
});
```

### What to Log:
- ✅ Error message and code
- ✅ Stack trace (for debugging)
- ✅ Request ID (for tracing)
- ✅ User ID (if authenticated)
- ✅ Operation name
- ✅ Sanitized input

### What NOT to Log:
- ❌ Passwords
- ❌ API keys/tokens
- ❌ Credit card numbers
- ❌ Full request bodies with sensitive data

---

## Error Handling Checklist

- [ ] Using typed error classes
- [ ] Errors handled at correct layer
- [ ] Internal errors not exposed to users
- [ ] All async operations have error handling
- [ ] Validation errors are detailed
- [ ] Errors logged with context
- [ ] Recovery patterns implemented where appropriate
- [ ] Request IDs included in error responses

---

## Resources

- [Node.js Error Handling Best Practices](https://nodejs.org/api/errors.html)
- [Error Handling in Express](https://expressjs.com/en/guide/error-handling.html)
