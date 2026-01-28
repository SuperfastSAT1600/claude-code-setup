# Agent & Workflow Rules (Ultra-Compact)

**Core principles**: Main agent CODES by default. Delegate specialized work only when needed. **DEFAULT TO PARALLEL** orchestration whenever possible.

---

## Main Agent Priority: CODE FIRST

**CRITICAL RULE: Main agent is primarily a CODER, not a coordinator. Do NOT delegate tasks you can handle directly. Only delegate when specific domain expertise is required.**

### Decision Tree
```
User requests task
    ↓
Is this a standard development task? (CRUD, simple feature, bug fix, refactor <5 files)
    ↓ YES → Main agent CODES directly (no delegation)
    ↓ NO → Requires specialized expertise?
        ↓ YES → Delegate to specialist(s)
        ↓ NO → Main agent CODES directly
```

### Red Flags (Main Agent Sitting Idle)
**BAD**: User asks to "add a login form" → delegate to auth-specialist and wait
**GOOD**: Main agent creates form component directly (standard React work)

**BAD**: User asks "fix the button styling" → delegate to code-reviewer and wait
**GOOD**: Main agent fixes CSS directly (standard development)

**BAD**: User asks "add API endpoint for users" → delegate to api-designer and wait
**GOOD**: Main agent creates endpoint directly (standard REST API work)

**BAD**: Delegate everything → sit idle → report results
**GOOD**: Code directly → delegate only specialized review/testing if needed

### When Delegation IS Appropriate
- OAuth/JWT implementation (auth-specialist)
- Complex database schema design (database-architect)
- Security audit of crypto/auth code (security-reviewer)
- Performance profiling and optimization (performance-optimizer)
- Complex CI/CD pipeline setup (ci-cd-specialist)
- Comprehensive test strategy (tdd-guide, unit-test-writer)

---

## Parallel-First Orchestration

**CRITICAL RULE: When delegation is necessary, ALWAYS prefer parallel over sequential. Launch multiple agents in one message with multiple Task tool calls.**

**NOTE**: This section applies AFTER determining delegation is needed. Most tasks should be coded by main agent directly (see "Main Agent Priority" section).

### Parallel Execution Decision Matrix (For Delegated Tasks)

| Scenario | Action | Example |
|----------|--------|---------|
| Tasks are independent (no data dependencies) | **PARALLEL** (single message, multiple Task calls) | code-reviewer + security-reviewer analyzing same codebase |
| Multiple exploration tasks | **PARALLEL** | Research auth patterns + DB schema + API design simultaneously |
| Multiple review tasks on completed work | **PARALLEL** | accessibility-auditor + performance-optimizer + code-reviewer |
| Task B needs output from Task A | **SEQUENTIAL** | planner completes → main agent implements using plan |
| Multiple tests after implementation | **PARALLEL** | unit-test-writer + e2e-runner + integration-test-writer |
| Documentation updates for different areas | **PARALLEL** | API docs + README + architecture docs |

### How to Launch Agents in Parallel

```
CORRECT (Parallel):
Send ONE message with multiple Task tool calls:
- Task(subagent_type="security-reviewer", prompt="...")
- Task(subagent_type="code-reviewer", prompt="...")
- Task(subagent_type="accessibility-auditor", prompt="...")

INCORRECT (Sequential):
Send message with Task(security-reviewer) → wait → send Task(code-reviewer) → wait...
```

### Common Parallel Patterns (When Delegation IS Appropriate)

**Post-implementation review** (optional, for large/critical changes):
- code-reviewer + security-reviewer + accessibility-auditor (all can review same code simultaneously)

**Specialized domain designs** (main agent implements afterward):
- auth-specialist(OAuth) + database-architect(schema) + api-designer(endpoints)
- Main agent CODES implementation using their designs

**Multi-layer testing** (after main agent writes code):
- unit-test-writer + e2e-runner + integration-test-writer (test different layers in parallel)

**Multi-domain exploration** (research phase only):
- Explore(auth patterns) + Explore(db schema) + Explore(api structure) (all read-only, independent)
- Main agent uses findings to CODE implementation

**Documentation updates** (different files, truly independent):
- doc-updater(API) + doc-updater(README) + doc-updater(changelog)

**Infrastructure work** (DevOps specialization needed):
- docker-specialist + ci-cd-specialist (containerization and pipelines are independent)
- Main agent can handle basic Docker/CI - only delegate complex setups

**IMPORTANT**: These are exception patterns, not defaults. Most work is handled by main agent directly.

---

## Hybrid Agent Principle

**Main agent is PRIMARILY a CODER, secondarily a COORDINATOR.** Default to coding directly. Only coordinate specialists when specific expertise is required.

### Main Agent Handles Directly (80% of tasks)
- Standard CRUD operations
- Simple bug fixes (< 3 files)
- Basic refactoring
- Documentation updates
- Simple feature implementation (components, routes, services, API endpoints)
- Git operations (commit, push, PR)
- Reading and analyzing code (<20 files)
- Template usage and pattern following
- Form components, UI components, standard React/Vue/Svelte work
- Basic API endpoints (REST CRUD)
- Simple database queries (SELECT, INSERT, UPDATE, DELETE)
- CSS/styling changes
- Configuration updates

### Delegate to Specialists When (20% of tasks)
- **Complex architecture** needed (architect, planner)
- **Specialized domains**: OAuth/JWT/SAML (auth-specialist), Complex schemas/indexes (database-architect), OpenAPI specs (api-designer), GraphQL schemas (graphql-specialist), WebSockets (websocket-specialist)
- **Security-critical** work requiring audit (security-reviewer)
- **Testing strategies** for large codebases (tdd-guide, unit-test-writer, e2e-runner)
- **Performance optimization** requiring profiling (performance-optimizer)
- **Operations work**: CI/CD pipelines (ci-cd-specialist), Multi-stage Docker (docker-specialist), Complex migrations (migration-specialist)
- **Code quality reviews** for large PRs (code-reviewer, security-reviewer)
- **Accessibility compliance** WCAG audits (accessibility-auditor)
- **Large refactors** (>5 files, architectural changes) (refactor-cleaner)

### Orchestrating Specialized Subagents

**Main agent can launch ANY mix of specialized subagents in parallel** - not just general agents:

```
Example 1: User wants OAuth login with user profiles
Main agent orchestrates in PARALLEL (single message):
- Task(subagent_type="auth-specialist", prompt="Design OAuth 2.0 flow with PKCE...")
- Task(subagent_type="database-architect", prompt="Design user profile schema...")
- Task(subagent_type="api-designer", prompt="Design auth endpoints...")
Then main agent integrates the designs

Example 2: User wants real-time chat with message persistence
Main agent orchestrates in PARALLEL:
- Task(subagent_type="websocket-specialist", prompt="Design Socket.io chat...")
- Task(subagent_type="database-architect", prompt="Design message storage...")
- Task(subagent_type="security-reviewer", prompt="Review message security...")
Then main agent implements integrated solution

Example 3: User wants to optimize slow dashboard
Main agent orchestrates in PARALLEL:
- Task(subagent_type="performance-optimizer", prompt="Profile and optimize...")
- Task(subagent_type="database-architect", prompt="Optimize queries...")
- Task(subagent_type="accessibility-auditor", prompt="Check WCAG compliance...")
Then main agent applies optimizations
```

### Delegation Guidelines
1. **Default**: Can I code this directly? (If YES, don't delegate)
2. **If delegating multiple specialists**: Can they run in parallel? (Default: YES unless data dependencies)
3. **Launch any mix**: Don't limit to general agents - orchestrate specific specialists needed
4. **Single message**: Launch all parallel specialists in ONE message with multiple Task calls

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

**REMINDER**: When launching multiple agents, send ONE message with multiple Task calls, not sequential messages. Model tier doesn't affect parallelization.

---

## Parallel vs Sequential: Comprehensive Guide

### Default to Parallel Unless:
1. Task B requires output/data from Task A (true data dependency)
2. Task B modifies what Task A is analyzing (write-read conflict)
3. User explicitly requests sequential execution

### Parallel Patterns (Use These Frequently)

**Quality gates (all read same codebase)**:
```
security-reviewer + code-reviewer + accessibility-auditor + performance-optimizer
```

**Multi-domain research (all read-only, different focus)**:
```
Explore(auth) + Explore(database) + Explore(api) + Explore(frontend)
```

**Test pyramid (different layers, independent)**:
```
unit-test-writer + integration-test-writer + e2e-runner
```

**Cross-cutting concerns (different aspects of same feature)**:
```
api-designer(endpoints) + database-architect(schema) + auth-specialist(permissions)
```

**Operations setup (infrastructure, independent services)**:
```
docker-specialist + ci-cd-specialist + monitoring-architect
```

**Documentation updates (different files)**:
```
doc-updater(API) + doc-updater(README) + doc-updater(CHANGELOG) + doc-updater(architecture)
```

### Must Be Sequential (True Dependencies)

**Planning then implementation**:
```
planner → [wait for plan] → implementation agent
```

**Implementation then testing**:
```
[write code] → [wait for completion] → unit-test-writer
```

**Build then deploy**:
```
build-error-resolver → [wait for green build] → deployment
```

**Schema then migrations**:
```
database-architect(schema) → [wait for schema] → migration-specialist(script)
```

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

### Simple Feature (Main Agent Codes - 80% of work)
```
User: "Add a user profile page"

1. Main agent: Read existing code, analyze patterns
2. Main agent: Create component using template
3. Main agent: Add route, wire up data
4. Main agent: Write tests
5. Main agent: Verify (lint, test, build)
6. Commit & PR

NO DELEGATION NEEDED - this is standard development work
```

### Standard Feature with Optional Review
```
User: "Add checkout form with validation"

1. Main agent: Create form component (React Hook Form + Zod)
2. Main agent: Add validation rules
3. Main agent: Wire up to API
4. Main agent: Write tests
5. Optional: **PARALLEL** (single message) if complex:
   - code-reviewer (large PR >200 lines)
   - security-reviewer (payment handling)
6. Commit & PR
```

### Feature Requiring Specialized Expertise
```
User: "Add OAuth login with user profile storage"

Main agent recognizes: Auth is complex, DB schema needs design

1. Main agent orchestrates **PARALLEL** (single message):
   - Task(subagent_type="auth-specialist", prompt="OAuth 2.0 PKCE flow")
   - Task(subagent_type="database-architect", prompt="User profile schema")

2. Main agent: CODES implementation using specialist designs
   - Implements OAuth flow
   - Creates database tables
   - Wires up frontend

3. Main agent: Write integration tests

4. Optional **PARALLEL**: security-reviewer + e2e-runner (if critical)

5. Commit & PR

NOTE: Main agent does the CODING. Specialists provide expertise, not implementation.
```

### Bug Fix (Main Agent Handles)
```
User: "Fix the checkout button not working"

1. Main agent: Read relevant code, identify issue
2. Main agent: Write regression test
3. Main agent: Fix bug
4. Main agent: Verify fix
5. Commit

NO DELEGATION NEEDED - standard debugging
```

### Complex Multi-Domain Feature
```
User: "Build real-time chat with message history and file uploads"

Main agent recognizes: WebSockets (specialized), Storage (specialized), DB (can handle)

1. Main agent orchestrates **PARALLEL** (single message):
   - Task(subagent_type="websocket-specialist", prompt="Socket.io chat design")
   - Task(subagent_type="database-architect", prompt="Message + file schema")

2. Main agent: CODES the implementation
   - Implements WebSocket handlers using specialist design
   - Creates database tables
   - Implements file upload endpoints
   - Builds chat UI components

3. Main agent: Write tests (unit + integration)

4. Optional **PARALLEL**: e2e-runner (chat flows) + security-reviewer (file uploads)

5. Commit & PR

NOTE: Main agent does 90% of coding. Specialists provide complex domain designs.
```

### Large Codebase Review (Delegate Appropriate)
```
User: "Review this PR for security issues" (400+ lines, auth changes)

Main agent orchestrates **PARALLEL** (single message):
- Task(subagent_type="security-reviewer", prompt="Audit auth changes...")
- Task(subagent_type="code-reviewer", prompt="Review code quality...")
- Task(subagent_type="accessibility-auditor", prompt="Check WCAG...")

Main agent: Summarize findings, suggest fixes

NOTE: Review tasks benefit from specialist expertise
```

### Realistic Daily Examples

**Example 1**: "Add dark mode toggle"
- Main agent: Codes directly (CSS, state management, persistence)
- No delegation needed

**Example 2**: "Optimize the slow dashboard"
- Main agent orchestrates **PARALLEL**: performance-optimizer + database-architect (query optimization)
- Main agent: Implements recommended optimizations

**Example 3**: "Add Google sign-in"
- Main agent orchestrates: auth-specialist (OAuth design)
- Main agent: CODES the implementation

**Example 4**: "Fix typo in README"
- Main agent: Edits directly
- No delegation needed

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

### Main Agent Handles Directly (Code Immediately)

| User Says | Main Agent Action |
|-----------|-------------------|
| "Add a login form" | Create component directly (standard React/form work) |
| "Fix the button styling" | Edit CSS directly |
| "Add API endpoint for users" | Create endpoint directly (standard REST CRUD) |
| "Fix this bug" | Debug and fix directly |
| "Add a profile page" | Create page/route directly |
| "Update the README" | Edit documentation directly |
| "Refactor this function" | Refactor directly (<5 files) |

### Route to Workflows/Specialists (Complex/Specialized)

| User Says | Route To | Why |
|-----------|----------|-----|
| "Add OAuth login" | auth-specialist | Complex auth pattern |
| "Review this for security" | /security-review | Security audit needed |
| "Is this code secure?" | security-reviewer | Security expertise |
| "Optimize the dashboard" | performance-optimizer | Profiling needed |
| "Set up CI/CD pipeline" | ci-cd-specialist | DevOps expertise |
| "Design GraphQL schema" | graphql-specialist | GraphQL expertise |
| "Add WebSocket chat" | websocket-specialist | Real-time expertise |
| "Review this large PR" | /review-changes | Comprehensive review |
| "Plan this feature" | /plan or planner | Architecture planning |

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
