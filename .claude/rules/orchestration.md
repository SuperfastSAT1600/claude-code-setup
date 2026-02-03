# Orchestration Rules

**Core principles**: Main agent is both CODER and ORCHESTRATOR. Delegate to specialists when needed. **DEFAULT TO PARALLEL** when there's natural parallel work. Don't force-create work.

---

## Main Agent Priority: DELEGATE CORRECTLY

**Core principle**: Delegate to specialists when needed. Stay active when there's parallel work. Don't force-create work.

### Delegation Decision Tree

```
Does this task need a specialist? (security-reviewer, auth-specialist, etc.)
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
1. PARALLEL: auth-specialist + database-architect
2. WHILE THEY RUN: Main agent codes UI, routing, error handling
3. Integrate specialist outputs
```

**Passive Delegation** (main agent correctly waits):
```
ALSO GOOD:
User: "Review my code for security issues"
1. Delegate: security-reviewer
2. Wait for results (no forced work)
3. Address findings

User: "Set up CI/CD pipeline"
1. Delegate: ci-cd-specialist
2. Wait for config (no forced work)
3. Review and commit
```

### When NOT to Force Work
- Pure review tasks (security, code quality, accessibility)
- Specialized setup (CI/CD, Docker, infrastructure)
- Research/exploration with no obvious implementation yet
- Planning phase (planner/architect output needed first)

---

## Parallel-First Orchestration

**Think**: "What can run in parallel?" + "What can I work on while they run?"

### Decision Matrix

| Scenario | Action |
|----------|--------|
| Tasks are independent | **PARALLEL** - single message, multiple Task calls |
| Multiple exploration tasks | **PARALLEL** - all read-only |
| Multiple reviews on same code | **PARALLEL** - all read-only |
| Task B needs output from Task A | **SEQUENTIAL** - wait for A |
| Task B modifies what Task A reads | **SEQUENTIAL** - conflict |

### How to Launch Parallel

```
CORRECT:
Send ONE message with multiple Task tool calls:
- Task(subagent_type="security-reviewer", prompt="...")
- Task(subagent_type="code-reviewer", prompt="...")
- Task(subagent_type="accessibility-auditor", prompt="...")

INCORRECT:
Task(security-reviewer) → wait → Task(code-reviewer) → wait...
```

---

## When to Delegate

### Delegate for Speed (parallel work)
- Multiple independent features can be built simultaneously
- Large task can be split across multiple agents
- General agents can handle parts while main agent handles others

### Delegate for Expertise (specialized knowledge)
- **Architecture**: architect, planner
- **Auth**: auth-specialist (OAuth, JWT, MFA)
- **Database**: database-architect (schemas, migrations)
- **API**: api-designer (REST, OpenAPI), graphql-specialist
- **Real-time**: websocket-specialist
- **Security**: security-reviewer
- **Testing**: tdd-guide, unit-test-writer, e2e-runner, integration-test-writer
- **Performance**: performance-optimizer
- **Operations**: ci-cd-specialist, docker-specialist, migration-specialist
- **Quality**: code-reviewer, accessibility-auditor
- **Refactoring**: refactor-cleaner, code-simplifier

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

## Common Parallel Patterns

### Quality Gates (all read same codebase)
```
security-reviewer + code-reviewer + accessibility-auditor + performance-optimizer
```

### Multi-Domain Research (all read-only)
```
Explore(auth) + Explore(database) + Explore(api) + Explore(frontend)
```

### Test Pyramid (different layers)
```
unit-test-writer + integration-test-writer + e2e-runner
```

### Cross-Cutting Feature Design
```
api-designer(endpoints) + database-architect(schema) + auth-specialist(permissions)
```

### Infrastructure Setup
```
docker-specialist + ci-cd-specialist + monitoring-architect
```

### Documentation Updates (different files)
```
doc-updater(API) + doc-updater(README) + doc-updater(CHANGELOG)
```

### Code + Documentation (parallel when possible)
```
PARALLEL:
- [Write feature code]
- doc-updater(update API docs for feature)

Then: Commit both together
```

---

## Must Be Sequential

**Planning → Implementation**:
```
planner → [wait] → main agent implements
```

**Implementation → Testing**:
```
[write code] → [wait] → unit-test-writer
```

**Schema → Migrations**:
```
database-architect(schema) → [wait] → migration-specialist(script)
```

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
| security-reviewer | Security audits, vulnerabilities |
| code-simplifier | Remove over-engineering |
| refactor-cleaner | Modernize legacy code |

### Testing
| Agent | Use For |
|-------|---------|
| tdd-guide | Red-Green-Refactor workflow |
| unit-test-writer | Unit test generation |
| integration-test-writer | Integration tests |
| e2e-runner | Playwright/Cypress tests |
| verify-app | Integration verification |

### Development (Specialized)
| Agent | Use For |
|-------|---------|
| api-designer | REST/GraphQL + OpenAPI specs |
| database-architect | Schema design, query optimization |
| auth-specialist | OAuth, JWT, MFA |
| graphql-specialist | GraphQL schemas, resolvers |
| websocket-specialist | Real-time Socket.io |

### Operations
| Agent | Use For |
|-------|---------|
| build-error-resolver | Fix build errors |
| ci-cd-specialist | Pipeline setup |
| docker-specialist | Containerization |
| doc-updater | **MANDATORY** after every code change (3+ files) |

### Model Tiers
- **haiku**: doc-updater, dependency-manager, Explore tasks
- **sonnet**: Most agents (DEFAULT)
- **opus**: security-reviewer, architect (critical decisions)

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
7. Commit
```

### Specialist-Only Task (Correct to Wait)
```
User: "Review my authentication code for security issues"

1. Delegate: security-reviewer (comprehensive audit)
2. Wait for results (no forced work - this is CORRECT)
3. Review findings
4. Address vulnerabilities
5. Commit fixes
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
5. Commit
```

### Feature with Specialized Needs
```
User: "Add OAuth login with user profiles"

1. Check skills: auth-patterns, react-patterns, frontend-patterns
2. PARALLEL (single message):
   - Task(auth-specialist, "Design OAuth 2.0 PKCE flow, use auth-patterns")
   - Task(database-architect, "Design user profile schema, use database-patterns")
3. WHILE THEY RUN: Main agent codes UI (react-patterns), error handling, routing
4. Integrate specialist designs with UI
5. PARALLEL: security-reviewer + e2e-runner + doc-updater
6. Commit
```

### Complex Multi-Part Feature
```
User: "Build e-commerce checkout"

1. PARALLEL (single message):
   - Task(general-purpose, "Build cart management")
   - Task(general-purpose, "Build order confirmation")
   - Task(api-designer, "Design payment API")
2. WHILE THEY RUN: Main agent codes checkout flow, validation
3. Integrate all parts
4. PARALLEL: unit-test-writer + e2e-runner + doc-updater
5. Commit
```

---

## Intent Routing

| User Says | Strategy |
|-----------|----------|
| "Add a login form" | Code directly |
| "Fix the button styling" | Edit directly |
| "Fix this bug" | Debug and fix directly |
| "Review for security" | **DELEGATE**: security-reviewer (wait is correct) |
| "Check accessibility" | **DELEGATE**: accessibility-auditor (wait is correct) |
| "Set up CI/CD" | **DELEGATE**: ci-cd-specialist (wait is correct) |
| "Containerize the app" | **DELEGATE**: docker-specialist (wait is correct) |
| "Add dashboard with widgets" | **PARALLEL**: Delegate widgets, code layout |
| "Add OAuth login" | **PARALLEL**: auth-specialist + db-architect, code UI |
| "Optimize dashboard" | **PARALLEL**: performance-optimizer + db-architect |
| "Add GraphQL API" | **PARALLEL**: graphql-specialist designs, code resolvers |
| "Add WebSocket chat" | **PARALLEL**: websocket-specialist + db-architect, code UI |

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

Avoid jargon. Say "Saving changes" not "git commit".

---

## Subagent Self-Correction

When delegating, expect subagents to fix `.claude/` issues they encounter:
- Broken references in own agent definition → fix directly
- Outdated advice in loaded skill → update skill
- Report all corrections in response for main agent to log
