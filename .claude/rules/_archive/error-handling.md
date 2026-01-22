# Error Handling Rules

Consistent error handling patterns across the application.

---

## 1. Error Class Hierarchy

**Rule**: Use typed error classes, not generic Error.

```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
  toJSON() {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }
}

// Specific errors
class ValidationError extends AppError {
  constructor(message: string, details?: unknown) { super(message, 'VALIDATION_ERROR', 400, details); }
}
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') { super(message, 'UNAUTHORIZED', 401); }
}
class NotFoundError extends AppError {
  constructor(resource: string, id?: string) { super(id ? `${resource} ${id} not found` : `${resource} not found`, 'NOT_FOUND', 404); }
}
class ConflictError extends AppError {
  constructor(message: string) { super(message, 'CONFLICT', 409); }
}
```

---

## 2. Layer Responsibilities

| Layer | Responsibility | Example |
|-------|---------------|---------|
| Repository | DB errors → Domain errors | `P2002` → `ConflictError` |
| Service | Business logic validation | Check rules, throw `ValidationError` |
| Controller | Format responses, pass to middleware | `next(error)` |
| Middleware | Log, format, respond | Known → typed response, Unknown → generic |

### Error Middleware
```typescript
function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Request failed', { error: error.message, stack: error.stack, requestId: req.id });

  if (error instanceof AppError) return res.status(error.statusCode).json(error.toJSON());
  if (error.name === 'ZodError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: error.errors } });

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', requestId: req.id } });
}
```

---

## 3. Never Expose Internal Errors

**Rule**: User-facing errors must be safe. Log details internally.

```typescript
// ✅ Log internally
logger.error('DB connection failed', { error: error.message, stack: error.stack });

// ✅ Return safe message
res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Service temporarily unavailable' } });

// ❌ Never expose
res.status(500).json({ error: error.message, stack: error.stack }); // Leaks internals!
```

---

## 4. Async Error Handling

**Rule**: Always handle promise rejections.

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

// Option 2: Wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get('/users/:id', asyncHandler(async (req, res) => {
  res.json({ data: await userService.findById(req.params.id) });
}));
```

---

## 5. Retry Pattern

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }
  throw new Error('Unreachable');
}
```

---

## 6. Logging

### What to Log
- ✅ Error message, code, stack
- ✅ Request ID, method, path
- ✅ User ID (if authenticated)
- ✅ Operation name, sanitized input

### Never Log
- ❌ Passwords, API keys, tokens
- ❌ Credit card numbers
- ❌ Full request bodies with sensitive data

---

## Checklist

- [ ] Using typed error classes
- [ ] Errors handled at correct layer
- [ ] Internal errors not exposed
- [ ] All async has error handling
- [ ] Errors logged with context
- [ ] Request IDs in responses
