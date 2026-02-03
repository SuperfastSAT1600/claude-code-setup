# Orchestration Rules

**Core principles**: Main agent is both CODER and ORCHESTRATOR. Delegate freely when it increases speed. **DEFAULT TO PARALLEL**. **NEVER SIT IDLE**.

---

## Main Agent Priority: STAY ACTIVE

**CRITICAL**: Main agent must NEVER sit idle waiting for subagents. Always be working on something.

### Active Orchestration Pattern

```
GOOD:
1. Launch agents in PARALLEL (single message, multiple Task calls)
2. WHILE THEY RUN: Main agent codes related work
3. Integrate specialist outputs

BAD:
1. Delegate to agent
2. Wait... (IDLE - this is the problem!)
3. Report results
```

### Main Agent Always Has Work
- Delegating everything → work on integration, testing, or documentation
- Delegating parts → work on other parts in parallel
- Delegating review → address findings as they come
- Delegating research → start coding based on existing patterns

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
| doc-updater | Documentation sync |

### Model Tiers
- **haiku**: doc-updater, dependency-manager, Explore tasks
- **sonnet**: Most agents (DEFAULT)
- **opus**: security-reviewer, architect (critical decisions)

---

## Workflow Examples

### Simple Feature (Main Agent)
```
User: "Add a user profile page"

1. Read existing code, analyze patterns
2. Create component
3. Add route, wire up data
4. Write tests
5. Commit
```

### Medium Feature (Parallel Delegation)
```
User: "Add dashboard with analytics, notifications, and settings"

1. PARALLEL (single message):
   - Task(general-purpose, "Build analytics widget")
   - Task(general-purpose, "Build notifications widget")
2. WHILE THEY RUN: Main agent builds settings widget + layout
3. Integrate all widgets
4. Commit
```

### Feature with Specialized Needs
```
User: "Add OAuth login with user profiles"

1. PARALLEL (single message):
   - Task(auth-specialist, "Design OAuth 2.0 PKCE flow")
   - Task(database-architect, "Design user profile schema")
2. WHILE THEY RUN: Main agent codes UI, error handling, routing
3. Integrate specialist designs with UI
4. PARALLEL: security-reviewer + e2e-runner
5. Commit
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
4. PARALLEL: unit-test-writer + e2e-runner
5. Commit
```

---

## Intent Routing

| User Says | Strategy |
|-----------|----------|
| "Add a login form" | Code directly |
| "Fix the button styling" | Edit directly |
| "Fix this bug" | Debug and fix directly |
| "Add dashboard with widgets" | **PARALLEL**: Delegate widgets, code layout |
| "Add OAuth login" | **PARALLEL**: auth-specialist + db-architect, code UI |
| "Review for security" | **PARALLEL**: security-reviewer + code-reviewer |
| "Optimize dashboard" | **PARALLEL**: performance-optimizer + db-architect |
| "Set up CI/CD" | Delegate ci-cd-specialist |
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
