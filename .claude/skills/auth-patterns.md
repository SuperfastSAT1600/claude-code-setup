# Authentication Patterns

Patterns for implementing secure authentication: JWT, OAuth2, session-based auth, and identity management.

---

## Authentication Methods

### Comparison
| Method | Use Case | Pros | Cons |
|--------|----------|------|------|
| **JWT** | APIs, SPAs, Mobile | Stateless, scalable | Can't revoke easily |
| **Session** | Traditional web apps | Easy revocation | Requires session store |
| **OAuth2** | Third-party login | No password handling | Complex to implement |
| **API Keys** | Server-to-server | Simple | Limited security |

---

## JWT Authentication

### Token Structure
```
Header.Payload.Signature

Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user123", "exp": 1234567890 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Implementation
```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'your-app',
    audience: 'your-app-users',
  });
}

function generateRefreshToken(user: User): string {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'your-app',
      audience: 'your-app-users',
    }) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired', 'TOKEN_EXPIRED');
    }
    throw new AuthError('Invalid token', 'INVALID_TOKEN');
  }
}
```

### Token Refresh Flow
```typescript
async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  // Verify refresh token
  const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

  // Check if refresh token is in database (for revocation support)
  const storedToken = await db.refreshTokens.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revokedAt) {
    throw new AuthError('Invalid refresh token');
  }

  // Get user
  const user = await db.users.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AuthError('User not found');

  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Rotate refresh token (invalidate old one)
  await db.refreshTokens.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  await db.refreshTokens.create({
    data: { token: newRefreshToken, userId: user.id },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

### JWT Middleware
```typescript
async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing authorization header' }
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({
        error: { code: error.code, message: error.message }
      });
    }
    next(error);
  }
}
```

---

## Session Authentication

### Session Store Setup
```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
```

### Login/Logout
```typescript
async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await db.users.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }

  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    if (err) return next(err);

    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({ data: { user: sanitizeUser(user) } });
  });
}

async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ data: { message: 'Logged out successfully' } });
  });
}
```

---

## OAuth2 / OpenID Connect

### OAuth2 Flow
```
1. User clicks "Login with Google"
2. Redirect to Google with client_id, redirect_uri, scope
3. User authorizes on Google
4. Google redirects back with authorization code
5. Exchange code for tokens (server-side)
6. Fetch user info with access token
7. Create/update user in database
8. Issue session/JWT for your app
```

### NextAuth.js Implementation
```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
```

### Manual OAuth2 Implementation
```typescript
// Step 1: Redirect to provider
function getAuthorizationUrl(provider: string): string {
  const config = OAUTH_CONFIGS[provider];

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: generateState(), // CSRF protection
  });

  return `${config.authorizationUrl}?${params}`;
}

// Step 2: Handle callback
async function handleOAuthCallback(
  provider: string,
  code: string,
  state: string
): Promise<User> {
  // Verify state to prevent CSRF
  if (!verifyState(state)) {
    throw new AuthError('Invalid state');
  }

  const config = OAUTH_CONFIGS[provider];

  // Exchange code for tokens
  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenResponse.json();

  // Fetch user info
  const userResponse = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = await userResponse.json();

  // Create or update user
  return await upsertOAuthUser(provider, profile, tokens);
}
```

---

## Password Security

### Hashing
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Requirements
```typescript
import { z } from 'zod';

const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// Check against common passwords
async function checkPasswordStrength(password: string): Promise<boolean> {
  const commonPasswords = await loadCommonPasswords();
  return !commonPasswords.includes(password.toLowerCase());
}
```

### Password Reset
```typescript
async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.users.findUnique({ where: { email } });

  // Always respond success (prevent email enumeration)
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResets.create({
    data: {
      userId: user.id,
      token: await hashPassword(token),
      expiresAt: expires,
    },
  });

  await sendPasswordResetEmail(email, token);
}

async function resetPassword(token: string, newPassword: string): Promise<void> {
  const resets = await db.passwordResets.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  // Find matching token
  let validReset = null;
  for (const reset of resets) {
    if (await verifyPassword(token, reset.token)) {
      validReset = reset;
      break;
    }
  }

  if (!validReset) {
    throw new AuthError('Invalid or expired reset token');
  }

  // Update password and invalidate token
  await db.$transaction([
    db.users.update({
      where: { id: validReset.userId },
      data: { passwordHash: await hashPassword(newPassword) },
    }),
    db.passwordResets.delete({ where: { id: validReset.id } }),
  ]);
}
```

---

## Multi-Factor Authentication (MFA)

### TOTP Implementation
```typescript
import { authenticator } from 'otplib';

function generateTOTPSecret(): { secret: string; uri: string; qrCode: string } {
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(user.email, 'YourApp', secret);
  const qrCode = await QRCode.toDataURL(uri);

  return { secret, uri, qrCode };
}

function verifyTOTP(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}

// Setup flow
async function enableMFA(userId: string): Promise<MFASetupResponse> {
  const { secret, qrCode } = generateTOTPSecret();

  // Store secret (encrypted)
  await db.mfaSecrets.create({
    data: {
      userId,
      secret: encrypt(secret),
      verified: false,
    },
  });

  return { qrCode };
}

async function verifyMFASetup(userId: string, token: string): Promise<void> {
  const mfa = await db.mfaSecrets.findUnique({ where: { userId } });
  const secret = decrypt(mfa.secret);

  if (!verifyTOTP(secret, token)) {
    throw new AuthError('Invalid verification code');
  }

  await db.mfaSecrets.update({
    where: { userId },
    data: { verified: true },
  });
}
```

---

## Authorization (RBAC)

### Permission Model
```typescript
interface Permission {
  resource: string;  // e.g., 'users', 'posts'
  action: string;    // e.g., 'read', 'write', 'delete'
}

interface Role {
  name: string;
  permissions: Permission[];
}

const ROLES: Record<string, Role> = {
  admin: {
    name: 'admin',
    permissions: [
      { resource: '*', action: '*' },
    ],
  },
  editor: {
    name: 'editor',
    permissions: [
      { resource: 'posts', action: 'read' },
      { resource: 'posts', action: 'write' },
      { resource: 'posts', action: 'delete' },
      { resource: 'users', action: 'read' },
    ],
  },
  viewer: {
    name: 'viewer',
    permissions: [
      { resource: 'posts', action: 'read' },
      { resource: 'users', action: 'read' },
    ],
  },
};
```

### Authorization Middleware
```typescript
function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
    }

    const hasPermission = user.roles.some(roleName => {
      const role = ROLES[roleName];
      return role.permissions.some(p =>
        (p.resource === '*' || p.resource === resource) &&
        (p.action === '*' || p.action === action)
      );
    });

    if (!hasPermission) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }

    next();
  };
}

// Usage
app.delete('/api/posts/:id',
  authMiddleware,
  requirePermission('posts', 'delete'),
  deletePostHandler
);
```

---

## Security Best Practices

### Cookie Settings
```typescript
const cookieOptions = {
  httpOnly: true,      // Prevent XSS access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000,     // 1 hour
  path: '/',
  domain: '.yourdomain.com',
};
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', authLimiter, loginHandler);
app.post('/api/auth/register', authLimiter, registerHandler);
```

### Account Lockout
```typescript
async function handleFailedLogin(userId: string): Promise<void> {
  const user = await db.users.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: { increment: 1 },
      lastFailedLogin: new Date(),
    },
  });

  if (user.failedLoginAttempts >= 5) {
    await db.users.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) }, // 30 min
    });
  }
}
```

---

## Resources

- OWASP Authentication Cheatsheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- JWT Best Practices: https://auth0.com/docs/secure/tokens/json-web-tokens
- NextAuth.js: https://next-auth.js.org/
- OAuth 2.0 Simplified: https://aaronparecki.com/oauth-2-simplified/
