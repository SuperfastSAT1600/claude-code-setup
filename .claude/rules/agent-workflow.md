# Agent & Workflow Rules (Ultra-Compact)

**Core principles**: Main agent is both CODER and ORCHESTRATOR. Delegate freely when it increases speed. **DEFAULT TO PARALLEL** orchestration. **STAY ACTIVE when parallel work exists**.

---

## Main Agent Priority: STAY ACTIVE

**Default: Look for parallel work during delegation. When natural parallel work exists, take it. When no parallel work exists (pure reviews, specialized setup, planning phases), waiting for the specialist is correct — don't force-create work.**

### Active Orchestration Patterns

**GOOD - Parallel work while main agent also codes**:
```
User: "Add OAuth login with user profiles"
1. Launch in PARALLEL (single message):
   - auth-specialist(OAuth design)
   - backend-specialist(user schema)
2. WHILE THEY RUN: Main agent codes UI components, routing, error handling
3. Integrate specialist outputs with main agent's work
```

**GOOD - Delegate multiple independent parts**:
```
User: "Build a blog with comments and auth"
1. Launch in PARALLEL (single message):
   - auth-specialist(auth system)
   - backend-specialist(blog + comment schema)
2. WHILE THEY RUN: Main agent codes frontend components
3. Integrate all parts
```

**GOOD - Delegate for speed even on general tasks**:
```
User: "Add user dashboard with multiple widgets"
1. Launch in PARALLEL (single message):
   - Task(general-purpose, "Create analytics widget")
   - Task(general-purpose, "Create notifications widget")
   - Task(general-purpose, "Create settings widget")
2. WHILE THEY RUN: Main agent creates dashboard layout and routing
3. Integrate widgets
```

**ACCEPTABLE - No parallel work available (waiting is correct)**:
```
User: "Review my code for security issues"
1. Delegate: code-reviewer
2. Wait for results (no forced work — this is CORRECT)
3. Address findings
```

**BAD - Sit idle when parallel work clearly exists**:
```
User: "Add OAuth login with user profiles"
1. Delegate to auth-specialist
2. Wait... (IDLE — you could be coding the UI!)
3. Report results
```

### Delegation Guidelines

**Delegate freely when**:
- Multiple independent parts can be built in parallel (speeds up delivery)
- Specialized expertise provides better quality (auth, performance, security)
- Task is large and can be split across multiple agents (faster completion)
- Main agent can work on other parts while delegation happens

**Main agent always has work (when parallel work exists)**:
- If delegating everything → work on integration, testing, or documentation
- If delegating parts → work on other parts in parallel
- If delegating review → address findings and iterate
- If delegating research → start coding based on existing patterns

---

## Parallel-First Orchestration

**CRITICAL RULE: When multiple independent pieces of work exist, launch agents in parallel AND stay active yourself. Use a single message with multiple Task tool calls.**

**Think**: "What can run in parallel?" + "What can I work on while they run?"

### Parallel Execution Decision Matrix

| Scenario | Action | Example |
|----------|--------|---------|
| Tasks are independent (no data dependencies) | **PARALLEL** (single message, multiple Task calls) | code-reviewer + frontend-specialist analyzing same codebase |
| Multiple exploration tasks | **PARALLEL** | Research auth patterns + DB schema + API design simultaneously |
| Multiple review tasks on completed work | **PARALLEL** | frontend-specialist + code-reviewer |
| Task B needs output from Task A | **SEQUENTIAL** | architect completes → main agent implements using plan |
| Multiple tests after implementation | **PARALLEL** | test-writer (unit + integration + E2E) |
| Documentation updates for different areas | **PARALLEL** | API docs + README + architecture docs |

### How to Launch Agents in Parallel

```
CORRECT (Parallel):
Send ONE message with multiple Task tool calls:
- Task(subagent_type="code-reviewer", prompt="...")
- Task(subagent_type="frontend-specialist", prompt="audit accessibility...")
- Task(subagent_type="test-writer", prompt="...")

INCORRECT (Sequential):
Send message with Task(code-reviewer) → wait → send Task(frontend-specialist) → wait...
```

### Common Parallel Patterns (Use Frequently)

**Split independent features** (delegate for speed):
- Task(general-purpose, widget1) + Task(general-purpose, widget2) + Task(general-purpose, widget3)
- Main agent codes integration while they run

**Specialized domain designs** (delegate for expertise):
- auth-specialist(OAuth) + backend-specialist(schema + API endpoints)
- Main agent codes UI/integration while they design

**Full test suite** (single delegation handles all layers):
- test-writer (handles unit + integration + E2E in one delegation)
- Main agent addresses findings while tests run

**Multi-domain exploration** (research phase):
- Explore(auth patterns) + Explore(db schema) + Explore(api structure) (all read-only)
- Main agent starts coding while exploration runs

**Post-implementation review** (quality gates):
- code-reviewer + frontend-specialist (review simultaneously)
- Main agent prepares next task while reviews run

**Documentation updates** (different files):
- doc-updater(API) + doc-updater(README) + doc-updater(changelog)
- Main agent works on tests while docs update

**Infrastructure work** (DevOps — single delegation):
- devops-specialist (handles CI/CD + Docker + monitoring as a unit)
- Main agent handles application code while infrastructure is set up

**IMPORTANT**: Delegation is encouraged when it increases speed or quality. Main agent stays active throughout.

---

## Hybrid Agent Principle

**Main agent is BOTH a CODER and ORCHESTRATOR.** Delegate freely for speed and expertise. Stay active — never idle when parallel work exists.

### When to Delegate

**Delegate for speed** (parallel work):
- Multiple independent features/components can be built simultaneously
- Large task can be split across multiple agents
- General agents can handle parts while main agent handles others

**Delegate for expertise** (specialized knowledge):
- **Complex architecture** (architect)
- **Specialized domains**: OAuth/JWT/SAML (auth-specialist), complex schemas/API/migrations (backend-specialist), GraphQL/WebSockets/AI (realtime-specialist)
- **Security & Quality**: code-reviewer
- **Testing strategies** (test-writer — handles TDD, unit, integration, E2E, load)
- **Frontend quality**: accessibility, i18n, performance (frontend-specialist)
- **Operations work**: CI/CD, Docker, IaC, monitoring, build errors (devops-specialist)
- **Mobile**: React Native, Flutter (mobile-specialist)
- **Documentation**: doc-updater

### Orchestrating Any Mix of Subagents

**Main agent can launch ANY mix of subagents in parallel** - specialized specialists, general agents, or both:

```
Example 1: User wants OAuth login with user profiles
Main agent orchestrates in PARALLEL (single message):
- Task(subagent_type="auth-specialist", prompt="Design OAuth 2.0 flow...")
- Task(subagent_type="backend-specialist", prompt="Design user schema...")
WHILE THEY RUN: Main agent codes UI components and routing
Then main agent integrates everything

Example 2: User wants dashboard with multiple widgets
Main agent orchestrates in PARALLEL (single message):
- Task(subagent_type="general-purpose", prompt="Build analytics widget...")
- Task(subagent_type="general-purpose", prompt="Build notifications widget...")
- Task(subagent_type="general-purpose", prompt="Build settings widget...")
WHILE THEY RUN: Main agent codes dashboard layout and state management
Then main agent integrates widgets

Example 3: User wants real-time chat with message persistence
Main agent orchestrates in PARALLEL:
- Task(subagent_type="realtime-specialist", prompt="Implement Socket.io chat...")
- Task(subagent_type="backend-specialist", prompt="Design message storage...")
WHILE THEY RUN: Main agent codes chat UI components
Then main agent wires everything together

Example 4: User wants to optimize slow dashboard
Main agent orchestrates in PARALLEL:
- Task(subagent_type="frontend-specialist", prompt="Profile and optimize frontend...")
- Task(subagent_type="backend-specialist", prompt="Optimize queries...")
WHILE THEY RUN: Main agent prepares test scenarios
Then main agent applies optimizations
```

### Key Principles
1. **Delegate freely**: If it speeds things up or improves quality, delegate
2. **Stay active**: While agents work, main agent codes/integrates/tests
3. **Parallel by default**: Launch independent work in ONE message with multiple Task calls
4. **Any mix**: Combine specialized specialists + general agents as needed

### Subagent Self-Correction
When delegating to a specialist, expect the subagent to fix `.claude/` issues it encounters during its work:
- If a subagent finds its own agent definition has broken references or outdated content, it should fix them
- If a skill it loads contains incorrect or outdated advice, it should update the skill
- Subagents report all corrections in their response; main agent logs them to `.claude/health/changelog.md`
- If the main agent itself makes an error, it appends a concise entry to the Error Log in `CLAUDE.md`

---

## Agent Quick Reference

| Agent | Use For |
|-------|---------|
| **architect** | System design, implementation plans, task breakdown, trade-off analysis |
| **code-reviewer** | PR reviews, security audits, code quality, TypeScript safety, tech debt |
| **test-writer** | TDD coaching, unit/integration/E2E/load tests, app verification |
| **backend-specialist** | REST API design, DB schema, migrations, OpenAPI specs |
| **auth-specialist** | OAuth, JWT, MFA, session management |
| **devops-specialist** | CI/CD, Docker, IaC, monitoring, build errors, dependencies |
| **frontend-specialist** | Accessibility (WCAG), i18n, Core Web Vitals, performance optimization |
| **realtime-specialist** | WebSockets, GraphQL, AI/ML integration |
| **mobile-specialist** | React Native, Flutter, cross-platform mobile |
| **doc-updater** | Documentation sync after code changes |
| **general-purpose** | Independent parallel features, research, exploration |

### Model Tiers (for Task delegation)
- **haiku**: doc-updater, Explore tasks
- **sonnet**: code-reviewer, auth-specialist, most agents (DEFAULT)
- **opus**: architect (critical decisions only)

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
code-reviewer + frontend-specialist
```

**Multi-domain research (all read-only, different focus)**:
```
Explore(auth) + Explore(database) + Explore(api) + Explore(frontend)
```

**Full test suite (single delegation)**:
```
test-writer (handles unit + integration + E2E)
```

**Cross-cutting concerns (different aspects of same feature)**:
```
backend-specialist(API + schema) + auth-specialist(permissions)
```

**Operations setup (infrastructure — single delegation)**:
```
devops-specialist (handles CI/CD + Docker + monitoring)
```

**Documentation updates (different files)**:
```
doc-updater(API) + doc-updater(README) + doc-updater(CHANGELOG) + doc-updater(architecture)
```

### Must Be Sequential (True Dependencies)

**Planning then implementation**:
```
architect → [wait for plan] → implementation
```

**Implementation then testing**:
```
[write code] → [wait for completion] → test-writer
```

**Build then deploy**:
```
[fix build errors] → [wait for green build] → deployment
```

**Schema then migrations**:
```
backend-specialist(schema) → [wait for schema] → backend-specialist(migration script)
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

### Simple Feature (Main Agent Handles)
```
User: "Add a user profile page"

1. Main agent: Read existing code, analyze patterns
2. Main agent: Create component using template
3. Main agent: Add route, wire up data
4. Main agent: Write tests
5. Commit & PR
```

### Review/Setup Task (Waiting Is Correct)
```
User: "Set up CI/CD pipeline"

1. Delegate: devops-specialist
2. Wait for config (no forced work — this is CORRECT)
3. Review output
4. Commit & PR
```

### Medium Feature (Delegate for Speed)
```
User: "Add dashboard with analytics, notifications, and settings"

1. Main agent orchestrates **PARALLEL** (single message):
   - Task(general-purpose, "Build analytics widget")
   - Task(general-purpose, "Build notifications widget")

2. WHILE THEY RUN: Main agent builds settings widget + dashboard layout

3. Main agent: Integrate all widgets, write integration tests

4. Commit & PR

NOTE: Delegation speeds up delivery - main agent stays active throughout
```

### Feature with Specialized Needs
```
User: "Add OAuth login with user profiles"

1. Main agent orchestrates **PARALLEL** (single message):
   - Task(auth-specialist, "Design OAuth 2.0 PKCE flow")
   - Task(backend-specialist, "Design user profile schema")

2. WHILE THEY RUN: Main agent codes UI components, error handling, routing

3. Main agent: Integrate specialist designs with UI code

4. Main agent: Write tests

5. Optional **PARALLEL**: code-reviewer + test-writer

6. Commit & PR

NOTE: Delegation for expertise, main agent stays active coding UI
```

### Complex Multi-Part Feature
```
User: "Build e-commerce checkout: cart, payment, order confirmation"

1. Main agent orchestrates **PARALLEL** (single message):
   - Task(general-purpose, "Build cart management")
   - Task(general-purpose, "Build order confirmation")
   - Task(backend-specialist, "Design payment API")

2. WHILE THEY RUN: Main agent codes checkout flow, validation, state management

3. Main agent: Integrate all parts

4. **PARALLEL** testing:
   - test-writer (unit + integration + E2E)

5. Commit & PR

NOTE: Mix of general + specialist agents, main agent actively integrating
```

### Large Feature (Maximum Parallelization)
```
User: "Build social media feed with posts, comments, likes, real-time updates"

1. Main agent orchestrates **PARALLEL** (single message):
   - Task(realtime-specialist, "Real-time updates system")
   - Task(backend-specialist, "Posts/comments/likes schema")
   - Task(general-purpose, "Post creation UI")
   - Task(general-purpose, "Comment system UI")

2. WHILE THEY RUN: Main agent codes feed layout, infinite scroll, state management

3. Main agent: Integrate all systems

4. **PARALLEL** testing + review:
   - test-writer
   - frontend-specialist (performance)

5. Commit & PR

NOTE: Maximum parallelization for speed, main agent stays busy throughout
```

### Quick Bug Fix
```
User: "Fix the checkout button not working"

Main agent: Read code, identify issue, write test, fix bug, verify, commit

NOTE: Fast enough without delegation
```

### Performance Investigation
```
User: "Dashboard is slow, fix it"

1. Main agent orchestrates **PARALLEL**:
   - Task(frontend-specialist, "Profile and identify frontend bottlenecks")
   - Task(backend-specialist, "Analyze query performance")

2. WHILE THEY RUN: Main agent reviews code for obvious issues

3. Main agent: Apply all optimizations

4. Main agent: Verify improvements

5. Commit
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

| User Says | Main Agent Strategy |
|-----------|---------------------|
| "Add a login form" | Code directly (standard React/form work) |
| "Fix the button styling" | Edit CSS directly |
| "Fix this bug" | Debug and fix directly |
| "Update the README" | Edit documentation directly |
| "Review for security" | **DELEGATE**: code-reviewer (waiting is correct) |
| "Check accessibility" | **DELEGATE**: frontend-specialist (waiting is correct) |
| "Set up CI/CD" | **DELEGATE**: devops-specialist (waiting is correct) |
| "Add dashboard with widgets" | **PARALLEL**: Delegate widgets, code layout simultaneously |
| "Add user profile page" | Code directly OR delegate if part of larger feature |
| "Build checkout flow" | **PARALLEL**: Delegate parts (cart, payment, confirmation), code integration |
| "Add OAuth login" | **PARALLEL**: Launch auth-specialist + backend-specialist, code UI simultaneously |
| "Optimize dashboard" | **PARALLEL**: frontend-specialist + backend-specialist, code improvements |
| "Add GraphQL API" | **PARALLEL**: realtime-specialist designs, main agent codes resolvers |
| "Add WebSocket chat" | **PARALLEL**: realtime-specialist + backend-specialist, code UI simultaneously |
| "Review this large PR" | **PARALLEL**: code-reviewer + frontend-specialist simultaneously |
| "Build social feed" | **PARALLEL**: Launch multiple agents for different parts, code core |

**Key principle**: Think "What can run in parallel?" and "What can I work on while agents run?"

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
