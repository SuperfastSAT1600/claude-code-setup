# Performance Rules

Optimize for performance and manage Claude Code resources effectively.

---

## 1. Model Selection

**Rule**: Use the right model for the task.

### Model Guidelines:
- **Haiku**: Simple, repetitive tasks (formatting, simple fixes)
- **Sonnet** (default): Most development tasks
- **Opus**: Complex architecture, critical decisions

```json
// In .claude/settings.json
{
  "model": "sonnet",  // Default
  "thinking": true     // Enable for complex tasks
}
```

### When to Use Each Model:

**Haiku** (Fast, cheap):
- Formatting code
- Simple refactoring
- Running tests
- Fixing linter errors
- Updating documentation

**Sonnet** (Balanced):
- Feature implementation
- Bug fixes
- Code reviews
- Test writing
- Refactoring

**Opus** (Powerful, expensive):
- System architecture decisions
- Complex algorithms
- Security-critical code
- Performance optimization
- Legacy code modernization

---

## 2. Context Window Management

**Rule**: Keep context under 80k tokens for optimal performance.

### Context Budget:
- **200k total** context window
- **Target**: Use 60-80k for best performance
- **Warning**: >150k slows down significantly

### What Uses Context:
- Codebase files read
- Conversation history
- MCP server tools
- Rules and skills files
- Agent definitions

### Optimization Strategies:

**1. Disable Unused MCP Servers:**
```json
{
  "mcpServers": {
    "github": { "disabled": true },
    "postgres": { "disabled": true }
  }
}
```

**2. Use Agent Delegation:**
```
Instead of: Reading 50 files in main context
Better: Delegate to specialized agent with focused context
```

**3. Keep Rules Concise:**
- Max 500 lines per rule file
- Split large rules into multiple files
- Remove outdated rules

**4. Use `disabledMcpServers` in Project Config:**
```json
// .claude/settings.local.json
{
  "disabledMcpServers": ["github", "slack", "vercel"]
}
```

---

## 3. File Reading Strategy

**Rule**: Read files strategically, not exhaustively.

### Do:
- ✅ Read files you'll modify
- ✅ Read related test files
- ✅ Read type definitions
- ✅ Use Grep to find specific code

### Don't:
- ❌ Read entire codebase at once
- ❌ Re-read unchanged files
- ❌ Read generated/build files
- ❌ Read large dependency files

### Example:
```
Bad: Read all 100 files in /src
Good: Grep for "UserService", read only relevant files
```

---

## 4. Parallel Agent Usage

**Rule**: Use parallel agents for independent tasks.

### When to Use Parallel Agents:
- Multiple independent features
- Different parts of codebase
- Testing while coding
- Research tasks

### Example:
```
Session 1: Implement authentication
Session 2: Write documentation
Session 3: Fix unrelated bugs
Session 4: Code review
Session 5: Performance testing
```

### Max Parallel Sessions:
- **Recommended**: 3-5 sessions
- **Maximum**: 5 sessions (diminishing returns)

---

## 5. Pre-Approved Operations

**Rule**: Pre-approve common operations to reduce permission prompts.

### High-Value Pre-Approvals:
```json
{
  "allowedPrompts": [
    {"tool": "Bash", "prompt": "run tests"},
    {"tool": "Bash", "prompt": "run build"},
    {"tool": "Bash", "prompt": "run linter"},
    {"tool": "Bash", "prompt": "format code"}
  ]
}
```

### Benefits:
- Faster workflows
- Fewer interruptions
- Better automation

---

## 6. Hook Performance

**Rule**: Keep hooks fast (<100ms) to avoid slowdowns.

### Do:
- ✅ Simple validation checks
- ✅ Fast grep operations
- ✅ Quick file checks

### Don't:
- ❌ Complex analysis
- ❌ Network requests
- ❌ Heavy computations
- ❌ Multiple file operations

### Example:
```json
// ✅ CORRECT: Fast hook
{
  "command": "grep -q 'TODO' $file_path && echo 'TODO found'"
}

// ❌ WRONG: Slow hook
{
  "command": "npm test && eslint . && npm audit"
}
```

---

## 7. Code Performance

**Rule**: Write efficient code. Profile before optimizing.

### Common Performance Issues:

**1. N+1 Queries:**
```typescript
// ❌ WRONG: N+1 queries
for (const user of users) {
  const posts = await db.posts.find({ userId: user.id });
}

// ✅ CORRECT: Single query
const userIds = users.map(u => u.id);
const posts = await db.posts.find({ userId: { $in: userIds } });
```

**2. Unnecessary Re-renders (React):**
```typescript
// ❌ WRONG: Re-renders on every parent update
function Child({ data }) {
  return <div>{expensiveCalculation(data)}</div>;
}

// ✅ CORRECT: Memoized
const Child = memo(function Child({ data }) {
  const result = useMemo(() => expensiveCalculation(data), [data]);
  return <div>{result}</div>;
});
```

**3. Synchronous Operations:**
```typescript
// ❌ WRONG: Blocks event loop
const data = fs.readFileSync('large-file.json');

// ✅ CORRECT: Non-blocking
const data = await fs.promises.readFile('large-file.json');
```

---

## 8. Caching Strategy

**Rule**: Cache expensive operations.

### What to Cache:
- API responses
- Database queries
- Computed values
- File reads

### Example:
```typescript
// Simple in-memory cache
const cache = new Map<string, any>();

async function getUser(id: string) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const user = await db.users.findOne({ id });
  cache.set(id, user);
  return user;
}
```

---

## 9. Bundle Size

**Rule**: Keep bundle sizes small for web applications.

### Targets:
- **Initial JS**: < 200kb gzipped
- **Total JS**: < 500kb gzipped
- **Images**: Use WebP, lazy load

### Strategies:
```typescript
// Code splitting
const Heavy = lazy(() => import('./HeavyComponent'));

// Tree shaking
import { specific } from 'lodash-es';  // ✅
import _ from 'lodash';                // ❌

// Dynamic imports
if (condition) {
  const module = await import('./module');
}
```

---

## 10. Database Optimization

**Rule**: Optimize database queries and use indexes.

### Best Practices:
```sql
-- ✅ Add indexes for frequent queries
CREATE INDEX idx_users_email ON users(email);

-- ✅ Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- ✅ Limit results
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;

-- ❌ Avoid SELECT *
SELECT id, name, email FROM users;
```

---

## Performance Checklist

Development:
- [ ] Using appropriate model (Haiku/Sonnet/Opus)
- [ ] Context usage under 80k tokens
- [ ] Unnecessary MCP servers disabled
- [ ] Pre-approved common operations
- [ ] Hooks complete in <100ms

Code:
- [ ] No N+1 queries
- [ ] Expensive calculations cached/memoized
- [ ] Async operations where appropriate
- [ ] Bundle size under target
- [ ] Database queries optimized with indexes

---

## Monitoring

```bash
# Check context usage (approximate)
claude --debug

# Profile Node.js app
node --inspect app.js

# Analyze bundle size
npm run build -- --analyze

# Check database query performance
EXPLAIN ANALYZE SELECT ...
```

---

## Resources

- Web Vitals: https://web.dev/vitals/
- React Performance: https://react.dev/learn/render-and-commit
- Database Indexing: https://use-the-index-luke.com/
