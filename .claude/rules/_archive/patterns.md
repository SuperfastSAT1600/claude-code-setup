# Common Patterns

Project-wide patterns. For detailed rules, see referenced files.

---

## 1. API Response Format

> See `api-design.md` for full details

```typescript
// Success: { "data": T, "meta"?: { timestamp, pagination } }
// Error: { "error": { "code": "ERROR_CODE", "message": "Human message" } }
```

---

## 2. Repository Pattern

**Rule**: Database access through repositories, never raw queries in controllers.

```typescript
class UserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    return this.db.users.findUnique({ where: { id } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.db.users.create({ data });
  }
}

// Controller uses repository
class UserController {
  constructor(private userRepo: UserRepository) {}

  async getUser(req, res) {
    const user = await this.userRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    return res.json({ data: user });
  }
}
```

---

## 3. Configuration Pattern

**Rule**: Validate environment config with Zod at startup.

```typescript
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = EnvSchema.parse(process.env);
```

---

## 4. Auth Pattern

**Rule**: Separate authentication (who) from authorization (what).

```typescript
// Authentication middleware
async function authenticate(req, res, next) {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
  req.user = await verifyToken(token);
  next();
}

// Authorization middleware
function requirePermission(permission: string) {
  return (req, res, next) => {
    if (!req.user?.hasPermission(permission)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    next();
  };
}

// Usage
app.delete('/api/users/:id', authenticate, requirePermission('delete:users'), handler);
```

---

## 5. Input Validation Pattern

**Rule**: Validate all input at API boundaries with Zod.

```typescript
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['user', 'admin']).default('user')
});

app.post('/api/users', async (req, res) => {
  try {
    const data = CreateUserSchema.parse(req.body);
    const user = await userService.create(data);
    return res.status(201).json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', details: error.errors }
      });
    }
    throw error;
  }
});
```

---

## 6. Firebase Integration

**Rule**: Admin SDK on backend, Client SDK on frontend.

### Backend
```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

async function verifyToken(token: string) {
  return admin.auth().verifyIdToken(token);
}
```

### Frontend
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({ apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY });
const auth = getAuth(app);
```

---

## Cross-Reference

| Pattern | Full Details In |
|---------|-----------------|
| API Response Format | `api-design.md` |
| Error Handling | `error-handling.md` |
| Logging | `error-handling.md` |
| Testing (AAA) | `testing.md` |
| Hook Performance | `hooks.md` |
| Pagination | `api-design.md` |

---

## Checklist

- [ ] API responses: `{ data }` or `{ error }`
- [ ] Database access via repositories
- [ ] Config validated with Zod
- [ ] Auth separated from authz
- [ ] Input validated at boundaries
- [ ] Firebase Admin SDK on backend only
