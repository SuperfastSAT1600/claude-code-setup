# Security Rules

**CRITICAL**: These rules must be followed at all times. Security is non-negotiable.

---

## 1. Never Hardcode Secrets

**Rule**: NEVER commit API keys, passwords, tokens, or any sensitive credentials to version control.

### What to Check:
- API keys (OpenAI, Stripe, AWS, etc.)
- Database passwords
- JWT secrets
- OAuth client secrets
- Private keys (.pem, .key files)
- Environment variables with sensitive data

### How to Handle Secrets:
```bash
# ✅ CORRECT: Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

# ❌ WRONG: Hardcoded secret
const apiKey = "sk-1234567890abcdef";
```

### Storage Options:
- Use `.env` files (add to `.gitignore`)
- Use secret management services (AWS Secrets Manager, Vault)
- Use environment variables in CI/CD

### Before Every Commit:
```bash
# Check for potential secrets
git diff | grep -i "api.key\|password\|secret\|token"
```

---

## 2. Input Validation & Sanitization

**Rule**: All user input must be validated and sanitized before use.

### SQL Injection Prevention:
```typescript
// ✅ CORRECT: Parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ WRONG: String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

### XSS Prevention:
```typescript
// ✅ CORRECT: Use framework's escaping
return <div>{escapeHtml(userInput)}</div>;

// ❌ WRONG: Direct HTML insertion
return <div dangerouslySetInnerHTML={{__html: userInput}} />;
```

### Command Injection Prevention:
```typescript
// ✅ CORRECT: Use array syntax
exec(['git', 'log', userProvidedBranch]);

// ❌ WRONG: String interpolation
exec(`git log ${userProvidedBranch}`);
```

---

## 3. Authentication & Authorization

**Rule**: Implement proper authentication and authorization checks.

### Authentication:
- Use established libraries (Passport, NextAuth, etc.)
- Hash passwords with bcrypt (min 10 rounds)
- Implement rate limiting on auth endpoints
- Use secure session management

### Authorization:
```typescript
// ✅ CORRECT: Check permissions before action
if (!user.hasPermission('delete:post')) {
  throw new ForbiddenError();
}
await deletePost(postId);

// ❌ WRONG: No permission check
await deletePost(postId);
```

### JWT Best Practices:
- Set short expiration times (15-30 minutes for access tokens)
- Use refresh tokens for longer sessions
- Store JWTs in httpOnly cookies, not localStorage
- Validate JWT signature on every request

---

## 4. HTTPS & Transport Security

**Rule**: Always use HTTPS in production. Never send sensitive data over HTTP.

### Requirements:
- Enforce HTTPS in production
- Set HSTS headers
- Use secure cookies (`secure: true, sameSite: 'strict'`)
- Validate SSL certificates

```typescript
// ✅ CORRECT: Secure cookie config
res.cookie('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000
});
```

---

## 5. Dependency Security

**Rule**: Keep dependencies updated and scan for vulnerabilities.

### Regular Checks:
```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Check for outdated packages
npm outdated
```

### Best Practices:
- Run `npm audit` before every deployment
- Use Dependabot or Renovate for automatic updates
- Review security advisories for critical dependencies
- Pin dependency versions in package.json
- Avoid packages with no recent activity

---

## 6. Rate Limiting & DoS Protection

**Rule**: Implement rate limiting on all public endpoints.

### Requirements:
- Rate limit authentication endpoints (5 attempts/15 min)
- Rate limit API endpoints (100 requests/min per IP)
- Implement CAPTCHA for sensitive operations
- Use CDN/WAF for DDoS protection

```typescript
// Example: Express rate limiting
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});

app.post('/api/login', authLimiter, loginHandler);
```

---

## 7. Error Handling & Information Disclosure

**Rule**: Never expose sensitive information in error messages.

### Safe Error Handling:
```typescript
// ✅ CORRECT: Generic error message
try {
  await processPayment(cardNumber);
} catch (error) {
  logger.error('Payment failed', { error, userId });
  return res.status(500).json({
    error: 'Payment processing failed. Please try again.'
  });
}

// ❌ WRONG: Exposes internal details
catch (error) {
  return res.status(500).json({
    error: error.message, // May contain DB schema, file paths, etc.
    stack: error.stack
  });
}
```

### Production Error Handling:
- Log full errors server-side
- Return generic messages to clients
- Never expose stack traces in production
- Don't include SQL queries in error responses

---

## 8. CORS Configuration

**Rule**: Configure CORS properly to prevent unauthorized access.

```typescript
// ✅ CORRECT: Specific origins
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));

// ❌ WRONG: Allow all origins
app.use(cors({ origin: '*' }));
```

---

## 9. File Upload Security

**Rule**: Validate and sanitize all file uploads.

### Requirements:
- Validate file types (check MIME type AND file extension)
- Limit file sizes
- Scan for malware
- Store uploads outside web root
- Generate random filenames
- Don't trust user-provided filenames

```typescript
// ✅ CORRECT: Validate uploads
const allowedTypes = ['image/jpeg', 'image/png'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
if (file.size > 5 * 1024 * 1024) { // 5MB
  throw new Error('File too large');
}
```

---

## 10. Logging & Monitoring

**Rule**: Log security events but never log sensitive data.

### What to Log:
- Authentication attempts (success/failure)
- Authorization failures
- Input validation failures
- Rate limit hits
- Suspicious activity patterns

### Never Log:
- Passwords
- Credit card numbers
- API keys
- Personal identifiable information (PII)
- Session tokens

```typescript
// ✅ CORRECT: Log without sensitive data
logger.info('Login attempt', {
  userId,
  ip: req.ip,
  success: false
});

// ❌ WRONG: Logs password
logger.info('Login attempt', {
  userId,
  password: req.body.password
});
```

---

## Security Checklist

Before every deployment:

- [ ] No hardcoded secrets in code
- [ ] All user inputs validated and sanitized
- [ ] Authentication/authorization properly implemented
- [ ] HTTPS enforced in production
- [ ] Dependencies scanned for vulnerabilities
- [ ] Rate limiting configured
- [ ] Error messages don't expose internals
- [ ] CORS configured correctly
- [ ] File uploads validated
- [ ] Security logging implemented

---

## When to Run Security Reviews

**Automatic**: Before every commit (use pre-commit hooks)
**Manual**: Use `/security-review` command before PRs
**Regular**: Weekly security audits for production code

---

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- npm audit: https://docs.npmjs.com/cli/v8/commands/npm-audit
