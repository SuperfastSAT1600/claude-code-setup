# Node.js Patterns

Best practices for Node.js backend development.

---

## Project Structure

### Layered Architecture
```
src/
├── config/                    # Configuration
│   ├── database.ts
│   ├── env.ts
│   └── index.ts
├── controllers/               # Request handlers
│   ├── userController.ts
│   └── orderController.ts
├── services/                  # Business logic
│   ├── userService.ts
│   └── orderService.ts
├── repositories/              # Data access
│   ├── userRepository.ts
│   └── orderRepository.ts
├── middleware/                # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/                    # Route definitions
│   ├── userRoutes.ts
│   └── index.ts
├── models/                    # Data models/types
│   └── user.ts
├── utils/                     # Utility functions
│   ├── logger.ts
│   └── helpers.ts
├── app.ts                     # Express app setup
└── server.ts                  # Server entry point
```

---

## Configuration Management

### Environment Variables
```typescript
// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REDIS_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
```

### Configuration Object
```typescript
// src/config/index.ts
import { env } from './env';

export const config = {
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
  },
  database: {
    url: env.DATABASE_URL,
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;
```

---

## Express Application Setup

### Application Factory
```typescript
// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import routes from './routes';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.server.isProduction
      ? ['https://example.com']
      : ['http://localhost:3000'],
    credentials: true,
  }));

  // Request parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Request logging
  app.use(pinoHttp({ logger }));

  // Request ID
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id']?.toString() || crypto.randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

### Server Entry Point
```typescript
// src/server.ts
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

async function main() {
  const app = createApp();

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  // Start server
  app.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port}`);
  });
}

main().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
```

---

## Error Handling

### Custom Error Classes
```typescript
// src/utils/errors.ts
export class AppError extends Error {
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
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}
```

### Error Handler Middleware
```typescript
// src/middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    err,
    requestId: req.id,
    method: req.method,
    path: req.path,
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.id,
      },
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.errors,
        requestId: req.id,
      },
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.id,
    },
  });
};
```

---

## Async Handler Wrapper

```typescript
// src/utils/asyncHandler.ts
import { RequestHandler, Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
router.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json({ data: users });
}));
```

---

## Validation Middleware

```typescript
// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
};

// Usage
import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(8),
  }),
});

router.post('/users', validate(createUserSchema), createUserHandler);
```

---

## Logging

```typescript
// src/utils/logger.ts
import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.logging.level,
  transport: config.server.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
  base: {
    env: config.server.env,
  },
  redact: ['req.headers.authorization', 'password', 'token'],
});

// Child logger with context
export function createLogger(context: string) {
  return logger.child({ context });
}

// Usage
const log = createLogger('UserService');
log.info({ userId: user.id }, 'User created');
log.error({ err, userId }, 'Failed to create user');
```

---

## Database Connection

### Prisma Setup
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Log queries in development
prisma.$on('query', (e) => {
  logger.debug({ query: e.query, duration: e.duration }, 'Database query');
});

prisma.$on('error', (e) => {
  logger.error({ message: e.message }, 'Database error');
});
```

---

## Rate Limiting

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts',
    },
  },
});

// Usage
app.use('/api', apiLimiter);
router.post('/auth/login', authLimiter, loginHandler);
```

---

## Service Layer Pattern

```typescript
// src/services/userService.ts
import { prisma } from '../lib/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { hashPassword } from '../utils/password';
import { CreateUserInput, UpdateUserInput } from '../models/user';

export class UserService {
  async findAll(options?: { page?: number; perPage?: number }) {
    const page = options?.page || 1;
    const perPage = options?.perPage || 20;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return { users, total, page, perPage };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id); // Ensure exists

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
```

---

## Best Practices Summary

1. **Validate all input** with Zod at API boundaries
2. **Use typed errors** with proper status codes
3. **Log structured data** with appropriate levels
4. **Handle async errors** with wrapper or try-catch
5. **Separate concerns** (controllers, services, repositories)
6. **Validate environment** variables at startup
7. **Implement graceful shutdown** for clean resource cleanup
8. **Use rate limiting** on public endpoints
9. **Add request IDs** for tracing
10. **Health check endpoint** for monitoring
