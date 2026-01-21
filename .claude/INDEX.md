# Claude Code Feature Index

**Quick Reference**: Single source of truth for all agents, commands, workflows, and tools.

---

## 🤖 Agents (28)

### Core Workflow
| Agent | When to Use | Model |
|-------|-------------|-------|
| **planner** | New features, unclear requirements | opus |
| **architect** | System design, architectural decisions | opus |
| **security-reviewer** | Before commits, security-critical changes | opus |
| **code-reviewer** | Comprehensive code review before PRs | opus |
| **verify-app** | After significant changes, before deployment | sonnet |

### Code Quality
| Agent | When to Use | Model |
|-------|-------------|-------|
| **code-simplifier** | Over-engineered code, unnecessary abstractions | opus |
| **refactor-cleaner** | Legacy code, dead code removal | sonnet |
| **tech-debt-analyzer** | Identify and prioritize technical debt | sonnet |
| **type-safety-enforcer** | Eliminate `any`, enforce strict TypeScript | haiku |

### Testing
| Agent | When to Use | Model |
|-------|-------------|-------|
| **tdd-guide** | Implementing new features with tests | sonnet |
| **unit-test-writer** | Generate unit tests with AAA pattern | sonnet |
| **integration-test-writer** | Create API/database integration tests | sonnet |
| **e2e-runner** | Web applications, user workflows | sonnet |
| **load-test-specialist** | Create k6/Artillery load tests | sonnet |

### Development
| Agent | When to Use | Model |
|-------|-------------|-------|
| **api-designer** | Design REST/GraphQL APIs, create OpenAPI specs | opus |
| **database-architect** | Design schemas, migrations, ERDs | opus |
| **auth-specialist** | Implement JWT/OAuth/session auth | opus |
| **graphql-specialist** | Design GraphQL schemas, optimize resolvers | sonnet |
| **websocket-specialist** | Implement Socket.io real-time features | sonnet |

### Operations
| Agent | When to Use | Model |
|-------|-------------|-------|
| **build-error-resolver** | Multiple build errors, complex compiler issues | opus |
| **ci-cd-specialist** | Create/optimize GitHub Actions pipelines | sonnet |
| **docker-specialist** | Write Dockerfiles, optimize builds | sonnet |
| **migration-specialist** | Safe database migrations with rollback | sonnet |
| **dependency-manager** | Audit, update, manage dependencies | haiku |

### Accessibility & i18n
| Agent | When to Use | Model |
|-------|-------------|-------|
| **accessibility-auditor** | WCAG 2.1 AA compliance audits | sonnet |
| **i18n-specialist** | Internationalization with next-intl | sonnet |

### Documentation
| Agent | When to Use | Model |
|-------|-------------|-------|
| **doc-updater** | After implementation, before PR | sonnet |
| **performance-optimizer** | Profile and optimize code, fix N+1 queries | sonnet |

---

## ⚡ Commands (20)

### Workflow Orchestration
| Command | Purpose | Duration |
|---------|---------|----------|
| `/full-feature` | Complete feature: plan → implement → test → review → PR | Long (hours) |
| `/quick-fix` | Fast bug fix: locate → fix → test → commit | Short (minutes) |
| `/spike` | Time-boxed research and technical exploration | Medium (30min-2hr) |

### Quality & Maintenance
| Command | Purpose | Duration |
|---------|---------|----------|
| `/lint-fix` | Run ESLint, Prettier, TypeScript with auto-fix | Fast (<1min) |
| `/type-check` | Strict TypeScript checking, eliminate `any` | Fast (<2min) |
| `/audit-deps` | Security audit + outdated check + license compliance | Fast (<1min) |
| `/dead-code` | Find and remove unused code/exports/dependencies | Medium (5-10min) |

### Development Tools
| Command | Purpose | Duration |
|---------|---------|----------|
| `/new-component` | Scaffold React component with tests and stories | Fast (<1min) |
| `/create-migration` | Generate database migration with rollback | Medium (5min) |
| `/update-docs` | Sync documentation with code changes | Medium (5-10min) |

### Existing Commands (from template)
| Command | Purpose |
|---------|---------|
| `/build-fix` | Fix build errors systematically |
| `/commit-push-pr` | Commit, push, create PR |
| `/e2e` | Generate and run E2E tests |
| `/plan` | Create implementation plans |
| `/refactor-clean` | Remove dead code, modernize |
| `/review-changes` | Review all uncommitted changes |
| `/security-review` | Comprehensive security audit |
| `/tdd` | TDD Red-Green-Refactor workflow |
| `/test-and-build` | Run tests and build |
| `/test-coverage` | Analyze and improve coverage |

---

## 📋 Workflows (5)

| Workflow | Steps | When to Use |
|----------|-------|-------------|
| **full-feature** | 8 steps: plan → branch → implement → test → review → docs → PR → merge | New feature development |
| **bug-fix** | 5 steps: reproduce → locate → fix → test → document | Bug resolution |
| **refactor** | 7 steps: analyze → plan → tests → refactor → verify → document → review | Code improvement |
| **release** | 10 steps: verify → version → changelog → tag → build → test → deploy → monitor | Production deployment |
| **security-audit** | 8 steps: scan → review → prioritize → fix → verify → document → report → monitor | Security assessment |

---

## ✅ Checklists (7)

| Checklist | Items | Purpose |
|-----------|-------|---------|
| **pr-review** | 25 items | Ensure PR quality before approval |
| **security-audit** | 40+ items | OWASP-based security verification |
| **performance-audit** | 35 items | Frontend/backend/database performance |
| **accessibility-audit** | 30 items | WCAG 2.1 AA compliance |
| **pre-release** | 45 items | Release readiness verification |
| **onboarding** | 50+ items | New developer setup |
| **ai-code-review** | 30+ items | Detect AI-generated code patterns and inconsistencies |

---

## 📝 Templates (5)

| Template | Purpose | Placeholders |
|----------|---------|--------------|
| **component.tsx** | React component with TypeScript | NAME, PROPS, DESCRIPTION |
| **api-route.ts** | Next.js API route (full CRUD) | RESOURCE, RESOURCE_SINGULAR, SCHEMA_DEFINITION |
| **test.spec.ts** | Vitest test file | FILE_PATH, FUNCTION_NAME, DESCRIPTION |
| **migration.sql** | Database migration + rollback | MIGRATION_NAME, DESCRIPTION, UP_SQL, DOWN_SQL |
| **pr-description.md** | PR description | SUMMARY, CHANGES, SCREENSHOTS, BREAKING_CHANGES |

---

## 🔧 Scripts (5)

| Script | Purpose | Execution |
|--------|---------|-----------|
| **pre-commit-checks.sh** | Validate before commits | PreToolUse hook |
| **require-tests-pass.sh** | Gate PR creation on tests | PreToolUse hook |
| **log-security-review.sh** | Audit trail for security | SubagentStop hook |
| **auto-format.sh** | Format on save | PostToolUse hook |
| **sync-deps.sh** | Sync and verify dependencies | Manual or CI |

---

## 📚 Skills (14)

### Framework-Specific Skills
| Skill | Coverage | Lines |
|-------|----------|-------|
| **react-patterns** | Hooks, memoization, compound components, error boundaries | 650 |
| **nextjs-patterns** | App Router, Server Components, Server Actions, middleware | 700 |
| **nodejs-patterns** | Express, error handling, validation, logging | 550 |
| **prisma-patterns** | Schema design, queries, transactions, migrations | 600 |
| **github-actions** | Workflows, matrix builds, caching, deployment | 500 |

### API & Real-time Skills
| Skill | Coverage | Lines |
|-------|----------|-------|
| **rest-api-design** | Resource naming, HTTP methods, pagination, versioning | 524 |
| **graphql-patterns** | Schema, resolvers, DataLoader, subscriptions | 602 |
| **websocket-patterns** | Socket.io, rooms, reconnection, scaling | 547 |

### Meta Skills
| Skill | Coverage | Lines |
|-------|----------|-------|
| **coding-standards** | SOLID, DRY, KISS, language-specific best practices | 600 |
| **backend-patterns** | Repository pattern, caching, auth, error handling | 550 |
| **frontend-patterns** | React patterns, state management, performance | 500 |
| **tdd-workflow** | Red-Green-Refactor cycle, test patterns, TDD methodology | 450 |
| **project-guidelines** | Template for project-specific customization | 300 |
| **user-intent-patterns** | Natural language intent detection and routing | 400 |

---

## 🎯 Decision Trees

### "I need to implement a feature"
```
Start with: /full-feature
  ↓
1. Planning phase uses planner agent
2. API design? → api-designer agent
3. Database changes? → database-architect agent
4. Authentication? → auth-specialist agent
5. Tests written by unit-test-writer + integration-test-writer agents
6. Code review by code-reviewer agent
7. Documentation by doc-updater agent
8. PR created with commit-push-pr
```

### "I found a bug"
```
Quick fix: /quick-fix
  ↓
1. Reproduce and locate issue
2. Fix the code
3. Add regression test (unit-test-writer agent)
4. Commit and push
```

### "Performance is slow"
```
Use: performance-optimizer agent
  ↓
1. Profile with Lighthouse/Chrome DevTools
2. Identify bottlenecks (N+1 queries, large bundles, etc.)
3. Implement optimizations
4. Verify with metrics
```

### "Need to audit security"
```
Use: /security-review command
  ↓
Delegates to security-reviewer agent which:
1. Scans for OWASP Top 10 vulnerabilities
2. Checks dependencies
3. Reviews authentication/authorization
4. Creates prioritized fix list
```

### "Code quality issues"
```
Maintenance commands:
  /lint-fix → ESLint + Prettier + TypeScript
  /type-check → Eliminate any types
  /dead-code → Remove unused code
  /audit-deps → Security audit
```

### "Setting up CI/CD"
```
Use: ci-cd-specialist agent
  ↓
Creates GitHub Actions with:
- Matrix builds
- Caching strategies
- Test + build + deploy pipeline
```

---

## 🔍 Quick Lookup

### By Use Case

**Frontend Development**: react-patterns, nextjs-patterns, new-component, accessibility-auditor, i18n-specialist

**Backend Development**: nodejs-patterns, prisma-patterns, api-designer, database-architect, rest-api-design

**Real-time Features**: websocket-specialist, websocket-patterns

**GraphQL APIs**: graphql-specialist, graphql-patterns

**Authentication**: auth-specialist, JWT/OAuth patterns in nodejs-patterns

**Testing**: unit-test-writer, integration-test-writer, load-test-specialist, /e2e, /tdd, /test-coverage

**DevOps**: ci-cd-specialist, docker-specialist, github-actions skill

**Performance**: performance-optimizer, load-test-specialist, bundle analysis

**Security**: /security-review, security-reviewer agent, security-audit checklist

**Database**: database-architect, migration-specialist, prisma-patterns, /create-migration

**Quality**: /lint-fix, /type-check, /dead-code, code-reviewer, tech-debt-analyzer

**Accessibility**: accessibility-auditor, accessibility-audit checklist

**Internationalization**: i18n-specialist, i18n patterns in nextjs-patterns

---

## 📖 Documentation Structure

```
.claude/
├── INDEX.md (this file) ← START HERE
├── GUIDE.md ← Consolidated README
├── agents/ (28 agents)
├── commands/ (20 commands)
├── rules/ (14 rules - always enforced)
├── skills/ (14 skills - reference knowledge)
├── workflows/ (5 workflows)
├── checklists/ (7 checklists)
├── templates/ (5 templates)
└── scripts/ (5 scripts)
```

---

## 🚀 Getting Started

1. **Read this file** - Understand what's available
2. **Check CLAUDE.md** - Project-specific context
3. **Browse rules/** - Auto-enforced guidelines
4. **Use commands** - Start with `/full-feature` or `/quick-fix`
5. **Delegate to agents** - Let specialists handle complex tasks

---

**Last Updated**: 2026-01-21
