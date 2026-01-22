# Performance Rules

Optimize Claude Code resources and write efficient code.

---

## 1. Model Selection

| Model | Use For | Cost |
|-------|---------|------|
| Haiku | Formatting, simple fixes, running tests | Fast/cheap |
| Sonnet | Feature implementation, reviews, refactoring | Balanced |
| Opus | Architecture, complex algorithms, security-critical | Powerful |

---

## 2. Context Management

> **Full details**: See `context-management.md`

**Rule**: Keep context under 80k tokens.

### Quick Tips
- Disable unused MCP servers
- Delegate when reading >10 files
- Keep rules <500 lines each
- Use Grep to find specific code vs reading all files

---

## 3. File Reading Strategy

### Do
- ✅ Read files you'll modify
- ✅ Read related tests and types
- ✅ Use Grep to find specific code

### Don't
- ❌ Read entire codebase
- ❌ Re-read unchanged files
- ❌ Read generated/build files

---

## 4. Parallel Agents

**Rule**: Use parallel agents for independent tasks.

- 3-5 sessions recommended
- Different parts of codebase
- Review while implementing
- Testing while coding

---

## 5. Code Performance

### N+1 Queries
```typescript
// ❌ N+1
for (const user of users) {
  const posts = await db.posts.find({ userId: user.id });
}

// ✅ Single query
const posts = await db.posts.find({ userId: { $in: userIds } });
```

### React Memoization
```typescript
const Child = memo(({ data }) => {
  const result = useMemo(() => expensiveCalc(data), [data]);
  return <div>{result}</div>;
});
```

### Async Operations
```typescript
// ❌ Blocks event loop
const data = fs.readFileSync('file.json');

// ✅ Non-blocking
const data = await fs.promises.readFile('file.json');
```

---

## 6. Bundle Size

| Target | Size |
|--------|------|
| Initial JS | <200kb gzipped |
| Total JS | <500kb gzipped |

```typescript
// Code splitting
const Heavy = lazy(() => import('./Heavy'));

// Tree shaking
import { specific } from 'lodash-es';  // ✅
import _ from 'lodash';                // ❌
```

---

## 7. Database

```sql
-- Add indexes
CREATE INDEX idx_users_email ON users(email);

-- Limit results
SELECT id, name FROM users LIMIT 20;

-- Avoid SELECT *
```

---

## Checklist

### Claude Code
- [ ] Appropriate model selected
- [ ] Context under 80k tokens
- [ ] Unused MCPs disabled
- [ ] Hooks <100ms

### Code
- [ ] No N+1 queries
- [ ] Expensive ops cached/memoized
- [ ] Async where appropriate
- [ ] Bundle size under target
- [ ] Database indexes added
