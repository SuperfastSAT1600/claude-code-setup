# Agent & Workflow Rules (Ultra-Compact)

Orchestrator principle: Delegate ALL implementation work. Parse intent, select agent, coordinate, report.

---

## Orchestrator Principle

**Main model is ORCHESTRATOR.** Coordinates work, never implements directly.

### Does
- Parse user intent
- Select and delegate to agents
- Coordinate parallel execution
- Report progress in plain English
- Git operations (commit, push, PR)

### Does NOT
- Write production code
- Implement features
- Fix bugs directly
- Read >10 files without delegating

### Delegation Rule
- ANY implementation > 2 steps: DELEGATE
- ANY code writing: DELEGATE
- Trivial 1-2 line changes: Handle directly

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

### Development
| Agent | Use For |
|-------|---------|
| implementer | Feature implementation |
| api-designer | REST/GraphQL API design |
| database-architect | Schema design, migrations |
| auth-specialist | Authentication features |

### Operations
| Agent | Use For |
|-------|---------|
| build-error-resolver | Fix build errors |
| ci-cd-specialist | Pipeline setup |
| docker-specialist | Containerization |
| doc-updater | Documentation sync |

### Model Tiers (for Task delegation)
- **haiku**: doc-updater, dependency-manager, Explore tasks
- **sonnet**: implementer, code-reviewer, most agents (DEFAULT)
- **opus**: security-reviewer, architect, planner (critical only)

---

## Parallel Execution

### Safe for Parallel (read-only)
- security-reviewer + code-reviewer
- accessibility-auditor + performance-optimizer

### Must Be Sequential
- planner -> implementer (needs plan)
- implementer -> unit-test-writer (needs code)

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

### New Feature
```
1. planner -> create plan
2. implementer -> write code
3. unit-test-writer -> add tests
4. code-reviewer + security-reviewer (parallel)
5. doc-updater -> update docs
6. Commit & PR
```

### Bug Fix
```
1. code-reviewer -> analyze issue
2. unit-test-writer -> write regression test
3. implementer -> fix bug
4. Verify fix
5. Commit
```

### Pre-Commit
```
1. Implement feature
2. Run in parallel:
   - security-reviewer
   - doc-updater
   - code-reviewer
3. Commit
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
| Before deploy | deployment checklist |
| Security changes | security-audit checklist |
