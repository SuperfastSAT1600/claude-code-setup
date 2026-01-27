# Agent & Workflow Rules (Ultra-Compact)

Hybrid principle: Main agent codes standard tasks, delegates specialized work. Balance efficiency with expertise.

---

## Hybrid Agent Principle

**Main agent is both CODER and COORDINATOR.** Handles standard development directly, delegates specialized tasks.

### Main Agent Handles Directly
- Standard CRUD operations
- Simple bug fixes (< 3 files)
- Basic refactoring
- Documentation updates
- Simple feature implementation (components, routes, services)
- Git operations (commit, push, PR)
- Reading and analyzing code (<20 files)
- Template usage and pattern following

### Delegate to Specialists When
- **Complex architecture** needed (architect, planner)
- **Specialized domains**: Auth (auth-specialist), DB schema (database-architect), APIs (api-designer), GraphQL (graphql-specialist), WebSockets (websocket-specialist)
- **Security-critical** work (security-reviewer)
- **Testing strategies** (tdd-guide, unit-test-writer, e2e-runner)
- **Performance optimization** (performance-optimizer)
- **Operations work**: CI/CD (ci-cd-specialist), Docker (docker-specialist), Migrations (migration-specialist)
- **Code quality reviews** (code-reviewer, security-reviewer)
- **Accessibility compliance** (accessibility-auditor)
- **Large refactors** (>5 files, refactor-cleaner)

### Delegation Guidelines
- Small, straightforward tasks: Handle directly
- Requires deep domain expertise: Delegate
- Multiple agents could work in parallel: Coordinate delegation. always prefer parallel work over sequential.

### Subagent Self-Correction
When delegating to a specialist, expect the subagent to fix `.claude/` issues it encounters during its work:
- If a subagent finds its own agent definition has broken references or outdated content, it should fix them
- If a skill it loads contains incorrect or outdated advice, it should update the skill
- Subagents report all corrections in their response; main agent logs them to `.claude/health/changelog.md`
- If the main agent itself makes an error, it appends a concise entry to the Error Log in `CLAUDE.md`

---

## Agent Quick Reference

### Planning & Architecture
| Agent | Use For |
|-------|---------|
| planner | Implementation plans, task breakdown |
| architect | System design, technical decisions |

### Code Quality
| Agent | Use For |
|-------|---------|
| code-reviewer | PR reviews, code quality |
| security-reviewer | Security audits, vulnerability checks |
| code-simplifier | Remove over-engineering |
| refactor-cleaner | Modernize legacy code |

### Testing
| Agent | Use For |
|-------|---------|
| tdd-guide | Red-Green-Refactor workflow |
| unit-test-writer | Unit test generation |
| e2e-runner | Playwright/Cypress tests |
| verify-app | Integration verification |

### Development (Specialized)
| Agent | Use For |
|-------|---------|
| api-designer | REST/GraphQL API design + OpenAPI specs |
| database-architect | Complex schema design, migrations |
| auth-specialist | OAuth, JWT, MFA implementation |
| graphql-specialist | GraphQL schemas, resolvers, subscriptions |
| websocket-specialist | Real-time Socket.io features |

### Operations
| Agent | Use For |
|-------|---------|
| build-error-resolver | Fix build errors |
| ci-cd-specialist | Pipeline setup |
| docker-specialist | Containerization |
| doc-updater | Documentation sync |

### Model Tiers (for Task delegation)
- **haiku**: doc-updater, dependency-manager, Explore tasks
- **sonnet**: code-reviewer, auth-specialist, most agents (DEFAULT)
- **opus**: security-reviewer, architect (critical decisions only)

---

## Parallel Execution

### Safe for Parallel (read-only)
- security-reviewer + code-reviewer
- accessibility-auditor + performance-optimizer

### Must Be Sequential
- planner -> main agent/specialist (needs plan if complex)
- implementation -> unit-test-writer (needs code)

---

## Git Workflow

### Branch Naming
```
feature/user-authentication
fix/login-error
hotfix/critical-security-patch
chore/update-dependencies
```

### Commit Format (Conventional Commits)
```
<type>(<scope>): <subject>

feat: add user registration
fix: resolve timezone bug
docs: update API docs
refactor: simplify auth
test: add checkout tests
chore: update dependencies
```

### Commit Rules
- Subject: max 72 chars, imperative mood
- No period at end
- Include "Closes #issue" if applicable

### PR Guidelines
- Max 400 lines changed
- Must pass CI (tests, lint, build)
- Requires 1 approval
- Delete branch after merge

### Git Safety
- NEVER force push to main/master
- NEVER skip hooks (--no-verify)
- Use `--force-with-lease` on feature branches only

---

## Common Workflows

### Simple Feature (Main Agent Handles)
```
1. Main agent: Analyze requirements
2. Main agent: Write code + tests
3. Main agent: Self-verify (lint, test, build)
4. Optional: code-reviewer (if complex)
5. Commit & PR
```

### Complex Feature (Use Specialists)
```
1. Optional: architect/planner -> design if complex
2. Main agent OR specialist -> implement
3. unit-test-writer -> comprehensive tests
4. code-reviewer + security-reviewer (parallel)
5. doc-updater -> update docs
6. Commit & PR
```

### Bug Fix (Main Agent Handles)
```
1. Main agent: Identify root cause
2. Main agent: Write regression test
3. Main agent: Fix bug
4. Main agent: Verify fix
5. Commit
```

### Pre-Commit Quality Check
```
1. Main agent implements feature
2. Run in parallel:
   - security-reviewer
   - code-reviewer (optional)
   - doc-updater (if needed)
3. Commit
```

### Post-Task Self-Improvement
```
1. Complete user's primary task
2. If system observations were noted during task:
   - Report observations grouped by type
   - Auto-apply trivial fixes (INDEX, references)
   - Propose significant changes for approval
3. Log all changes to .claude/health/changelog.md
4. Commit system changes separately from task changes
```

---

## Intent Routing

| User Says | Route To |
|-----------|----------|
| "I want...", "Add...", "Build..." | /full-feature |
| "Fix...", "Broken...", "Error..." | /quick-fix |
| "Review...", "Check..." | /review-changes |
| "Secure?", "Safe?" | /security-review |
| "Slow...", "Optimize..." | performance-optimizer |
| "Test...", "Coverage..." | /test-coverage |

---

## Progress Reporting

Report in plain English:
```
Building your feature:

[Done] Step 1: Planning complete
[Working] Step 2: Writing code...
[Pending] Step 3: Testing
```

Avoid jargon. Say "Saving changes" not "git commit".

---

## Checklist Gates

| Gate | Run |
|------|-----|
| Before PR | pr-review checklist |
| Before deploy | deployment-checklist |
| Security changes | security-audit checklist |
| Build errors | build-errors-checklist |
| E2E tests | e2e-testing-checklist |
| Database migrations | database-migration-review |
| Dependencies | dependency-audit |
| Hotfixes | hotfix-checklist |

## Template Usage

| Task | Template |
|------|----------|
| New component | component.tsx.template, form.tsx.template |
| API route | api-route.ts.template |
| Tests | test.spec.ts.template |
| Migrations | migration.sql.template |
| PRs | pr-description.md.template |
| Auth guards | guard.ts.template, middleware.ts.template |
| Services | service.ts.template |
| Docker | Dockerfile.template |
| CI/CD | github-workflow.yml |
| E2E config | playwright.config.ts |
