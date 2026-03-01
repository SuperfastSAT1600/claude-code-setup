# Orchestration Rules

**Core principles**: Main agent is both CODER and ORCHESTRATOR. Delegate to specialists when needed. **DEFAULT TO PARALLEL** when there's natural parallel work. Don't force-create work.

---

## Main Agent Priority: DELEGATE CORRECTLY

**Core principle**: Delegate to specialists when needed. Stay active when there's parallel work. Don't force-create work.

### Delegation Decision Tree

```
Does this task need a specialist? (code-reviewer, auth-specialist, etc.)
├─ YES → Is there natural parallel work for main agent?
│  ├─ YES → Delegate + work in parallel (IDEAL)
│  └─ NO → Delegate + wait (CORRECT - don't force-create work)
└─ NO → Main agent handles directly
```

### Active vs Passive Delegation

**Active Delegation** (main agent works while specialist runs):
```
GOOD:
User: "Add OAuth login with user profiles"
1. PARALLEL: auth-specialist + backend-specialist
2. WHILE THEY RUN: Main agent codes UI, routing, error handling
3. Integrate specialist outputs
```

**Passive Delegation** (main agent correctly waits):
```
ALSO GOOD:
User: "Review my code for security issues"
1. Delegate: code-reviewer
2. Wait for results (no forced work)
3. Address findings

User: "Set up CI/CD pipeline"
1. Delegate: devops-specialist
2. Wait for config (no forced work)
3. Review
```

**BAD - Sit idle when parallel work clearly exists**:
```
User: "Add OAuth login with user profiles"
1. Delegate to auth-specialist
2. Wait... (IDLE — you could be coding the UI!)
3. Report results
```

### When NOT to Force Work
- Pure review tasks (security, code quality, accessibility)
- Specialized setup (CI/CD, Docker, infrastructure)
- Research/exploration with no obvious implementation yet
- Planning phase (architect output needed first)

### Delegation Guidelines

**Delegate freely when**:
- Multiple independent parts can be built in parallel (speeds up delivery)
- Specialized expertise provides better quality (auth, performance, security)
- Task is large and can be split across multiple agents (faster completion)
- Main agent can work on other parts while delegation happens

**Main agent always has work (when parallel work exists)**:
- If delegating everything -> work on integration, testing, or documentation
- If delegating parts -> work on other parts in parallel
- If delegating review -> address findings and iterate
- If delegating research -> start coding based on existing patterns

---

## Parallel-First Orchestration

**Think**: "What can run in parallel?" + "What can I work on while they run?"

### Decision Matrix

| Scenario | Action | Example |
|----------|--------|---------|
| Tasks are independent | **PARALLEL** - single message, multiple Task calls | code-reviewer + frontend-specialist analyzing same codebase |
| Multiple exploration tasks | **PARALLEL** - all read-only | Research auth patterns + DB schema + API design simultaneously |
| Multiple reviews on same code | **PARALLEL** - all read-only | frontend-specialist + code-reviewer |
| Task B needs output from Task A | **SEQUENTIAL** - wait for A | architect completes -> main agent implements using plan |
| Task B modifies what Task A reads | **SEQUENTIAL** - conflict | |
| Multiple tests after implementation | **PARALLEL** | test-writer (unit + integration + E2E) |
| Documentation updates for different areas | **PARALLEL** | API docs + README + architecture docs |

### How to Launch Parallel

```
CORRECT:
Send ONE message with multiple Task tool calls:
- Task(subagent_type="code-reviewer", prompt="...")
- Task(subagent_type="frontend-specialist", prompt="audit accessibility...")
- Task(subagent_type="test-writer", prompt="...")

INCORRECT:
Task(code-reviewer) → wait → Task(frontend-specialist) → wait...
```

---

## When to Delegate

### Delegate for Speed (parallel work)
- Multiple independent features can be built simultaneously
- Large task can be split across multiple agents
- General agents can handle parts while main agent handles others

### Delegate for Expertise (specialized knowledge)
- **Architecture & Planning**: architect
- **Auth**: auth-specialist (OAuth, JWT, MFA)
- **Backend**: backend-specialist (API design, DB schema, migrations)
- **Real-time & GraphQL & AI**: realtime-specialist
- **Security & Quality**: code-reviewer
- **Testing**: test-writer (TDD, unit, integration, E2E, load)
- **Frontend Quality**: frontend-specialist (accessibility, i18n, performance)
- **Operations**: devops-specialist (CI/CD, Docker, IaC, monitoring, build errors, deps)
- **Mobile**: mobile-specialist
- **Documentation**: doc-updater

---

## Skills-First Approach (MANDATORY)

**Before coding or delegating**, check if relevant skills exist.

### Skill Usage Protocol

```
1. Identify task domain (auth, API, database, frontend, etc.)
2. Check if skill exists for that domain
3. Load skill (Skill tool for user-invocable, or reference .claude/skills/)
4. Apply skill patterns to your work
5. If pattern doesn't fit → log observation for skill enhancement
```

### Common Skill Mappings

| Task Type | Load These Skills |
|-----------|-------------------|
| Auth implementation | auth-patterns |
| REST API design | rest-api-design, backend-patterns |
| GraphQL API | graphql-patterns |
| React components | react-patterns, frontend-patterns |
| Next.js pages | nextjs-patterns, react-patterns |
| Node.js services | nodejs-patterns, backend-patterns |
| Database schema | database-patterns |
| Docker setup | docker-patterns |
| CI/CD pipeline | github-actions |
| WebSocket setup | websocket-patterns |
| TDD workflow | tdd-workflow |
| Documentation | documentation-patterns |

### Error to Log

If you code without checking skills first:
```
[context] Error: Didn't check skills before coding | Should have loaded: [skill-name]
```

---

## Orchestrating Any Mix of Subagents

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

---

## Common Parallel Patterns

### Quality Gate (all read same codebase)
```
code-reviewer + frontend-specialist(accessibility)
```

### Multi-Domain Research (all read-only)
```
Explore(auth) + Explore(database) + Explore(api) + Explore(frontend)
```

### Full Test Suite (single delegation)
```
test-writer (handles unit + integration + E2E)
```

### Cross-Cutting Feature Design
```
backend-specialist(API + schema) + auth-specialist(permissions)
```

### Infrastructure Setup (single delegation)
```
devops-specialist (handles CI/CD + Docker + monitoring)
```

### Code + Documentation (parallel when possible)
```
PARALLEL:
- [Write feature code]
- doc-updater(update API docs for feature)
```

---

## Must Be Sequential

**Planning → Implementation**:
```
architect → [wait] → main agent implements
```

**Implementation → Testing**:
```
[write code] → [wait] → test-writer
```

**Schema → Migrations**:
```
backend-specialist(schema design) → [wait] → backend-specialist(migration script)
```

---

## Agent Quick Reference

| Agent | Model | Use For |
|-------|-------|---------|
| architect | opus | Implementation plans, system design, trade-off analysis |
| code-reviewer | sonnet | PR reviews, security audits, TypeScript safety, tech debt |
| test-writer | sonnet | TDD, unit/integration/E2E/load tests, verification |
| backend-specialist | sonnet | REST API design, DB schema, migrations |
| auth-specialist | sonnet | OAuth, JWT, MFA, session management |
| devops-specialist | sonnet | CI/CD, Docker, IaC, monitoring, build errors, deps |
| frontend-specialist | sonnet | Accessibility, i18n, Core Web Vitals optimization |
| realtime-specialist | sonnet | WebSockets, GraphQL, AI/ML integration |
| mobile-specialist | sonnet | React Native, Flutter, mobile apps |
| doc-updater | haiku | **MANDATORY** after every code change (3+ files) |
| general-purpose | sonnet | Independent parallel features, research, exploration |

### Model Tiers (for Task delegation)
- **haiku**: doc-updater, Explore tasks
- **sonnet**: code-reviewer, auth-specialist, most agents (DEFAULT)
- **opus**: architect (critical decisions only)

**REMINDER**: When launching multiple agents, send ONE message with multiple Task calls, not sequential messages. Model tier doesn't affect parallelization.

---

## Workflow Examples

### Simple Feature (Main Agent)
```
User: "Add a user profile page"

1. Check skills: react-patterns, frontend-patterns
2. Read existing code, analyze patterns
3. Create component (following react-patterns)
4. Add route, wire up data
5. Write tests (following tdd-workflow if complex)
6. Update documentation (API docs, README, changelog)
```

### Specialist-Only Task (Correct to Wait)
```
User: "Review my authentication code for security issues"

1. Delegate: code-reviewer (comprehensive audit including security)
2. Wait for results (no forced work - this is CORRECT)
3. Review findings
4. Address vulnerabilities
```

### Medium Feature (Parallel Delegation)
```
User: "Add dashboard with analytics, notifications, and settings"

1. PARALLEL (single message):
   - Task(general-purpose, "Build analytics widget")
   - Task(general-purpose, "Build notifications widget")
2. WHILE THEY RUN: Main agent builds settings widget + layout
3. Integrate all widgets
4. Update documentation (README usage, API docs, changelog)
```

### Feature with Specialized Needs
```
User: "Add OAuth login with user profiles"

1. Check skills: auth-patterns, react-patterns, frontend-patterns
2. PARALLEL (single message):
   - Task(auth-specialist, "Design OAuth 2.0 PKCE flow, use auth-patterns")
   - Task(backend-specialist, "Design user profile schema, use database-patterns")
3. WHILE THEY RUN: Main agent codes UI (react-patterns), error handling, routing
4. Integrate specialist designs with UI
5. PARALLEL: code-reviewer + test-writer + doc-updater
```

### Complex Multi-Part Feature
```
User: "Build e-commerce checkout"

1. PARALLEL (single message):
   - Task(general-purpose, "Build cart management")
   - Task(general-purpose, "Build order confirmation")
   - Task(backend-specialist, "Design payment API")
2. WHILE THEY RUN: Main agent codes checkout flow, validation
3. Integrate all parts
4. PARALLEL: test-writer + doc-updater
```

### Large Feature (Maximum Parallelization)
```
User: "Build social media feed with posts, comments, likes, real-time updates"

1. Main agent orchestrates PARALLEL (single message):
   - Task(realtime-specialist, "Real-time updates system")
   - Task(backend-specialist, "Posts/comments/likes schema")
   - Task(general-purpose, "Post creation UI")
   - Task(general-purpose, "Comment system UI")
2. WHILE THEY RUN: Main agent codes feed layout, infinite scroll, state management
3. Main agent: Integrate all systems
4. PARALLEL testing + review: test-writer + frontend-specialist (performance)
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

1. Main agent orchestrates PARALLEL:
   - Task(frontend-specialist, "Profile and identify frontend bottlenecks")
   - Task(backend-specialist, "Analyze query performance")
2. WHILE THEY RUN: Main agent reviews code for obvious issues
3. Main agent: Apply all optimizations
4. Main agent: Verify improvements
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

| User Says | Strategy |
|-----------|----------|
| "Add a login form" | Code directly |
| "Fix the button styling" | Edit directly |
| "Fix this bug" | Debug and fix directly |
| "Review for security" | **DELEGATE**: code-reviewer (wait is correct) |
| "Check accessibility" | **DELEGATE**: frontend-specialist (wait is correct) |
| "Set up CI/CD" | **DELEGATE**: devops-specialist (wait is correct) |
| "Containerize the app" | **DELEGATE**: devops-specialist (wait is correct) |
| "Update the README" | Edit documentation directly |
| "Add dashboard with widgets" | **PARALLEL**: Delegate widgets, code layout |
| "Add user profile page" | Code directly OR delegate if part of larger feature |
| "Build checkout flow" | **PARALLEL**: Delegate parts (cart, payment, confirmation), code integration |
| "Add OAuth login" | **PARALLEL**: auth-specialist + backend-specialist, code UI |
| "Optimize dashboard" | **PARALLEL**: frontend-specialist + backend-specialist |
| "Add GraphQL API" | **PARALLEL**: realtime-specialist designs, main agent codes resolvers |
| "Add WebSocket chat" | **PARALLEL**: realtime-specialist + backend-specialist, code UI |
| "Review this large PR" | **PARALLEL**: code-reviewer + frontend-specialist simultaneously |
| "Build social feed" | **PARALLEL**: Launch multiple agents for different parts, code core |

**Key principle**: Think "What can run in parallel?" and "What can I work on while agents run?"

---

## Git Workflow

### Branch Naming
```
feature/user-authentication
fix/login-error
hotfix/critical-security-patch
chore/update-dependencies
```

### Commit Format
```
<type>(<scope>): <subject>

feat: add user registration
fix: resolve timezone bug
docs: update API docs
refactor: simplify auth
test: add checkout tests
chore: update dependencies
```

### Rules
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

## Progress Reporting

Report in plain English:
```
Building your feature:

[Done] Step 1: Planning complete
[Working] Step 2: Writing code...
[Pending] Step 3: Testing
```

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

---

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

---

## Subagent Self-Correction

When delegating, expect subagents to fix `.claude/` issues they encounter:
- Broken references in own agent definition -> fix directly
- Outdated advice in loaded skill -> update skill
- Report all corrections in response for main agent to log
