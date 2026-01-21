# Agent Delegation Rules

Know when to delegate tasks to specialized agents for better results and context management.

---

## 1. When to Use Agents

**Rule**: Delegate complex, specialized, or context-heavy tasks to agents.

### Use Agents For:
- ✅ Security audits (isolated security context)
- ✅ Performance optimization (focused profiling)
- ✅ Test generation (TDD workflow)
- ✅ Documentation updates (sync code → docs)
- ✅ Refactoring large files (separate context)
- ✅ Build error resolution (iterative fixing)
- ✅ E2E test writing (Playwright/Cypress expertise)

### Don't Use Agents For:
- ❌ Simple one-line fixes
- ❌ Formatting code
- ❌ Reading a single file
- ❌ Trivial changes
- ❌ Tasks you can do in main context

---

## 2. Available Agents (28 Total)

### Core Workflow Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **planner** | New features, unclear requirements | Creates implementation plans, identifies dependencies | `/plan` |
| **architect** | System design, architectural decisions | Evaluates trade-offs, suggests patterns | Delegate directly |
| **security-reviewer** | Before commits, security-critical changes | OWASP checks, vulnerability scanning, secret detection | `/security-review` |
| **code-reviewer** | Comprehensive code review before PRs | Reviews code quality, patterns, potential issues | `/review-changes` |
| **verify-app** | After significant changes, before deployment | End-to-end testing, integration checks | Delegate directly |

### Code Quality Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **code-simplifier** | Over-engineered code, unnecessary abstractions | Removes complexity, inlines single-use functions | Delegate directly |
| **refactor-cleaner** | Legacy code, dead code removal | Modernizes code, removes unused code | `/refactor-clean` |
| **tech-debt-analyzer** | Technical debt assessment | Identifies and prioritizes technical debt | Delegate directly |
| **type-safety-enforcer** | TypeScript issues, `any` types | Eliminates `any`, enforces strict TypeScript | `/type-check` |

### Testing Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **tdd-guide** | Implementing new features with tests | Guides through Red-Green-Refactor cycle | `/tdd` |
| **unit-test-writer** | Unit test generation | Generates unit tests with AAA pattern | Delegate directly |
| **integration-test-writer** | API/database tests | Creates API/database integration tests | Delegate directly |
| **e2e-runner** | Web applications, user workflows | Generates and runs Playwright/Cypress tests | `/e2e` |
| **load-test-specialist** | Performance testing | Creates k6/Artillery load tests | Delegate directly |

### Development Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **api-designer** | REST/GraphQL API design | Designs APIs, creates OpenAPI specs | Delegate directly |
| **database-architect** | Schema design, migrations | Designs schemas, ERDs, migrations | Delegate directly |
| **auth-specialist** | Authentication features | Implements JWT/OAuth/session auth | Delegate directly |
| **graphql-specialist** | GraphQL implementation | Designs GraphQL schemas, optimizes resolvers | Delegate directly |
| **websocket-specialist** | Real-time features | Implements Socket.io real-time features | Delegate directly |

### Operations Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **build-error-resolver** | Multiple build errors, complex compiler issues | Iteratively fixes build errors | `/build-fix` |
| **ci-cd-specialist** | Pipeline setup, GitHub Actions | Creates/optimizes CI/CD pipelines | Delegate directly |
| **docker-specialist** | Containerization | Writes Dockerfiles, optimizes builds | Delegate directly |
| **migration-specialist** | Database migrations | Safe database migrations with rollback | `/create-migration` |
| **dependency-manager** | Dependency issues | Audits, updates, manages dependencies | `/audit-deps` |

### Accessibility & i18n Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **accessibility-auditor** | A11y compliance | WCAG 2.1 AA compliance audits | Delegate directly |
| **i18n-specialist** | Internationalization | Internationalization with next-intl | Delegate directly |

### Documentation Agents

| Agent | When to Use | What It Does | Command |
|-------|-------------|--------------|---------|
| **doc-updater** | After implementation, before PR | Syncs documentation with code changes | `/update-docs` |
| **performance-optimizer** | Slow applications | Profile and optimize code, fix N+1 queries | Delegate directly |

---

## 3. Agent Delegation Syntax

### Direct Delegation:
```
"Delegate to the security-reviewer agent to audit the authentication module"

"Use the planner agent to create an implementation plan for user notifications"

"Have the refactor-cleaner agent modernize the legacy UserService class"
```

### Via Commands:
```
/security-review
/plan
/tdd
/build-fix
/refactor-clean
/update-docs
/e2e
```

---

## 4. Agent Context Management

**Rule**: Provide agents with focused context, not entire codebase.

### Good Delegation:
```
"Delegate to planner agent:
- Goal: Implement user notifications
- Files: UserService.ts, NotificationService.ts
- Requirements: Email and in-app notifications"
```

### Bad Delegation:
```
"Have an agent look at everything and figure out what to do"
```

### Context Tips:
- Specify which files to focus on
- Provide clear goals
- Include relevant constraints
- Mention related systems

---

## 5. When NOT to Delegate

**Rule**: Don't delegate if you can do it faster in main context.

### Keep in Main Context:
- Reading 1-3 files
- Simple edits
- Running a single command
- Quick refactoring
- Small bug fixes

### Delegate to Agent:
- Reading 10+ files
- Complex analysis
- Multi-step workflows
- Specialized expertise needed
- Context-heavy tasks

---

## 6. Parallel Agent Usage

**Rule**: Run multiple agents in parallel for independent tasks.

### Example Parallel Work:
```
Session 1 (Main): Implementing feature
Session 2 (Security Agent): Security audit
Session 3 (Test Agent): Writing E2E tests
Session 4 (Doc Agent): Updating documentation
```

### Benefits:
- Faster completion
- Independent contexts
- Specialized focus
- Better resource use

---

## 7. Agent Communication

**Rule**: Agents return results to main context. Review and apply.

### Workflow:
1. Delegate task to agent
2. Agent completes work
3. Agent returns findings/code
4. You review in main context
5. You apply or reject changes

### Example:
```
You: "Delegate to security-reviewer to audit authentication"
Agent: Returns list of 5 vulnerabilities with severity levels
You: Review findings, prioritize fixes, implement
```

---

## 8. Agent Limitations

**Rule**: Understand what agents can and cannot do.

### Agents Can:
- ✅ Read files
- ✅ Analyze code
- ✅ Generate code
- ✅ Run read-only commands
- ✅ Create reports

### Agents Cannot:
- ❌ Make commits (you do this)
- ❌ Push to remote (you do this)
- ❌ Approve changes (you do this)
- ❌ Make architectural decisions (they advise)
- ❌ Access main conversation history (usually)

---

## 9. Agent Selection Matrix

### Core Tasks
| Task | Agent | Reason |
|------|-------|--------|
| Plan feature | planner | Breaks down requirements |
| Design system | architect | Evaluates architecture |
| Security audit | security-reviewer | Specialized security knowledge |
| Code review | code-reviewer | Quality patterns, best practices |
| Verify changes | verify-app | End-to-end testing |

### Code Quality Tasks
| Task | Agent | Reason |
|------|-------|--------|
| Remove complexity | code-simplifier | Focused on simplification |
| Clean code | refactor-cleaner | Modernization patterns |
| Analyze tech debt | tech-debt-analyzer | Prioritizes technical debt |
| Fix TypeScript | type-safety-enforcer | Strict type checking |

### Testing Tasks
| Task | Agent | Reason |
|------|-------|--------|
| TDD workflow | tdd-guide | Red-Green-Refactor expertise |
| Unit tests | unit-test-writer | AAA pattern, coverage |
| Integration tests | integration-test-writer | API/database testing |
| E2E tests | e2e-runner | Playwright/Cypress |
| Load tests | load-test-specialist | k6/Artillery |

### Development Tasks
| Task | Agent | Reason |
|------|-------|--------|
| API design | api-designer | REST/GraphQL patterns |
| Database design | database-architect | Schema, migrations, ERDs |
| Authentication | auth-specialist | JWT/OAuth expertise |
| GraphQL | graphql-specialist | Schema, resolvers |
| WebSocket | websocket-specialist | Socket.io real-time |

### Operations Tasks
| Task | Agent | Reason |
|------|-------|--------|
| Fix build | build-error-resolver | Iterative error fixing |
| CI/CD setup | ci-cd-specialist | GitHub Actions pipelines |
| Containerization | docker-specialist | Dockerfile optimization |
| DB migrations | migration-specialist | Safe migrations with rollback |
| Dependency issues | dependency-manager | Audit, update, manage deps |

### Accessibility & i18n Tasks
| Task | Agent | Reason |
|------|-------|--------|
| A11y audit | accessibility-auditor | WCAG 2.1 AA compliance |
| Internationalization | i18n-specialist | next-intl patterns |

### Documentation Tasks
| Task | Agent | Reason |
|------|-------|--------|
| Update docs | doc-updater | Code-doc sync |
| Optimize performance | performance-optimizer | Profiling, N+1 fixes |

---

## 10. Agent Performance

**Rule**: Use agents to reduce main context bloat.

### Context Savings:
```
Without Agent:
Main context: 150k tokens
- 50 files read
- Security analysis
- Test generation
- Documentation
Result: Slow, approaching limit

With Agents:
Main context: 60k tokens
Security agent: 40k tokens (separate)
Test agent: 30k tokens (separate)
Doc agent: 20k tokens (separate)
Result: Fast, efficient
```

---

## Agent Delegation Checklist

Before delegating:
- [ ] Task is complex enough to warrant delegation
- [ ] Clear goal and context provided
- [ ] Relevant files identified
- [ ] Appropriate agent selected
- [ ] Can't be done faster in main context

After delegation:
- [ ] Review agent findings
- [ ] Validate recommendations
- [ ] Apply changes selectively
- [ ] Test results
- [ ] Update documentation if needed

---

## Common Patterns

### Pattern 1: Pre-Commit Workflow
```
1. Implement feature (main context)
2. Security audit (security-reviewer agent)
3. Update docs (doc-updater agent)
4. Run tests (main context)
5. Commit (main context)
```

### Pattern 2: New Feature Workflow
```
1. Plan (planner agent)
2. Review plan (main context)
3. Implement (main context with TDD agent)
4. Verify (verify-app agent)
5. Document (doc-updater agent)
```

### Pattern 3: Legacy Code Workflow
```
1. Analyze (main context)
2. Modernize (refactor-cleaner agent)
3. Add tests (tdd-guide agent)
4. Security audit (security-reviewer agent)
5. Document changes (doc-updater agent)
```

---

## Resources

- Agent Architecture: See .claude/agents/ directory
- Commands: See .claude/commands/ directory
- Skills: See .claude/skills/ directory
