# Orchestration Rules

**Core**: Main agent is CODER + ORCHESTRATOR. Two parallel systems: **Subagents** (one-shot specialists) and **Agent Teams** (persistent teammates). Stay active when parallel work exists; wait when it doesn't — don't force-create work.

---

## Subagents vs Agent Teams

Two distinct parallel systems. **Never mix them up.**

| | Subagents (Task tool) | Agent Teams (TeamCreate) |
|---|---|---|
| **Lifecycle** | Fire-and-forget: run, return result, gone | Persistent: stay alive, claim tasks, message peers |
| **Communication** | Report back to caller only | Message each other directly |
| **Coordination** | Caller manages all work | Shared task list with self-coordination |
| **Best for** | Focused specialist tasks (review, research, one-off) | Parallel implementation, multi-REQ TDD, research debates |
| **Token cost** | Lower (results summarized back) | Higher (each teammate = separate Claude instance) |
| **Nesting** | Teammates CAN spawn subagents | Teammates CANNOT spawn teams (no nested teams) |

### When to Use Which

```
Parallel TDD (2+ REQs)?
├─ YES → Agent Teams via /parallel-tdd
└─ NO → Subagents
     ├─ Specialist needed? → Task(specialist-agent)
     ├─ Independent parts? → Multiple Task calls in one message
     └─ Simple task? → Main agent handles directly
```

### During an Agent Team Session

- **Lead**: Coordinates teammates. May also spawn subagents for one-off specialist tasks (architecture review, security audit) that don't belong on the shared task list.
- **Teammates**: Prefer messaging each other for coordination (shared interfaces, API contracts). Only spawn subagents for truly isolated specialist work within their own scope (e.g., reviewing their own code for security). Do NOT spawn subagents for tasks that should be on the shared task list.
- **Token awareness**: A 3-teammate session + subagents can balloon fast. Default to messaging a peer over spawning a new subagent.

---

## Delegation Decision (Subagents)

```
Specialist needed? (auth, security, devops, etc.)
├─ YES → Natural parallel work for main agent?
│  ├─ YES → Delegate + work in parallel (IDEAL)
│  └─ NO → Delegate + wait (CORRECT)
└─ NO → Main agent handles directly
```

**Delegate when**: Independent parts can run in parallel | Specialized expertise needed | Task splits across agents | Main agent can code other parts

**Main agent stays active**: Delegating everything → work on integration/tests/docs | Delegating parts → code other parts | Delegating review → iterate on findings

---

## Parallel-First Orchestration (Subagents)

**CRITICAL**: Launch independent subagents in parallel via ONE message with multiple Task calls. Think: "What can run in parallel?" + "What can I work on while they run?"

### Decision Matrix

| Scenario | Action |
|----------|--------|
| Independent tasks | **PARALLEL** — single message, multiple Task calls |
| Multiple exploration/review tasks | **PARALLEL** — all read-only |
| Task B needs Task A output | **SEQUENTIAL** |
| Task B modifies what Task A reads | **SEQUENTIAL** |

### Common Patterns

- **Feature split**: Task(general-purpose, widget1) + Task(general-purpose, widget2) — main codes layout
- **Domain design**: auth-specialist + backend-specialist — main codes UI
- **Quality gate**: code-reviewer + frontend-specialist (parallel reviews)
- **Test suite**: test-writer (handles unit + integration + E2E)
- **Exploration**: Explore(auth) + Explore(db) + Explore(api)
- **Infrastructure**: devops-specialist (CI/CD + Docker + monitoring)
- **Docs**: doc-updater(API) + doc-updater(README)

---

## Agent Quick Reference

| Agent | Model | Use For |
|-------|-------|---------|
| **architect** | opus | System design, plans, trade-offs |
| **code-reviewer** | sonnet | PR reviews, security, TypeScript, tech debt |
| **test-writer** | sonnet | TDD, unit/integration/E2E/load tests |
| **backend-specialist** | sonnet | REST API, DB schema, migrations |
| **auth-specialist** | sonnet | OAuth, JWT, MFA, sessions |
| **devops-specialist** | sonnet | CI/CD, Docker, IaC, monitoring, build errors, deps |
| **frontend-specialist** | sonnet | Accessibility, i18n, Core Web Vitals |
| **realtime-specialist** | sonnet | WebSockets, GraphQL |
| **ai-specialist** | sonnet | LLM integration, RAG, prompt engineering, embeddings |
| **mobile-specialist** | sonnet | React Native, Flutter |
| **doc-updater** | haiku | Documentation sync |

**Model tiers**: haiku (doc-updater, Explore) | sonnet (most agents, DEFAULT) | opus (architect, critical decisions)

> For tasks needing no specialist, use `Task(prompt)` with `subagent_type: general-purpose` directly — no agent definition file needed.

---

## Skills-First Protocol (MANDATORY)

Before coding: call `Skill("name")` to load relevant domain patterns.

| Task Type | Load These Skills |
|-----------|-------------------|
| Auth | `Skill("auth-patterns")` |
| REST API | `Skill("rest-api-design")`, `Skill("backend-patterns")` |
| GraphQL | `Skill("graphql-patterns")` |
| React | `Skill("react-patterns")`, `Skill("frontend-patterns")` |
| Next.js | `Skill("nextjs-patterns")`, `Skill("react-patterns")` |
| Node.js | `Skill("nodejs-patterns")`, `Skill("backend-patterns")` |
| Database | `Skill("database-patterns")` |
| Docker | `Skill("docker-patterns")` |
| CI/CD | `Skill("github-actions")` |
| WebSocket | `Skill("websocket-patterns")` |
| TDD | `Skill("tdd-workflow")` |
| Code Review | `Skill("coding-standards")` |
| Spec Writing | `Skill("spec-writing")` |
| Agent Orchestration | `Skill("agent-orchestration")` |
| LLM/AI Prompts | `Skill("prompt-engineering")` |
| RAG/Vector Search | `Skill("rag-patterns")` |
| Intent Routing | `Skill("user-intent-patterns")` |
| Dev Server Config | `Skill("dev-server-autoopen")` |

---

## Intent Routing

| User Says | Strategy | System |
|-----------|----------|--------|
| "Add a login form" | Code directly | — |
| "Fix this bug" | Debug and fix directly | — |
| "Review for security" | **DELEGATE**: code-reviewer (wait) | Subagent |
| "Check accessibility" | **DELEGATE**: frontend-specialist (wait) | Subagent |
| "Set up CI/CD" | **DELEGATE**: devops-specialist (wait) | Subagent |
| "Add dashboard with widgets" | **PARALLEL**: Delegate widgets, code layout | Subagents |
| "Add OAuth login" | **PARALLEL**: auth-specialist + backend-specialist, code UI | Subagents |
| "Optimize dashboard" | **PARALLEL**: frontend-specialist + backend-specialist | Subagents |
| "Build social feed" | **PARALLEL**: Multiple agents for parts, code core | Subagents |
| "Add RAG search" | **DELEGATE**: ai-specialist (wait) | Subagent |
| "Integrate LLM API" | **DELEGATE**: ai-specialist (wait) | Subagent |
| `/parallel-tdd` | Spec → team → worktrees → shared task list | Agent Teams |
| "Investigate from multiple angles" | Spawn teammates with competing hypotheses | Agent Teams |
| "Review PR from 3 perspectives" | Spawn review teammates (security, perf, tests) | Agent Teams |

---

## Sequential Dependencies

- **Planning → Implementation**: architect → wait → implement
- **Implementation → Testing**: write code → wait → test-writer
- **Schema → Migrations**: backend-specialist(schema) → wait → migration script

---

## Git Workflow

**Branches**: `feature/...`, `fix/...`, `hotfix/...`, `chore/...`
**Commits**: `<type>(<scope>): <subject>` — max 72 chars, imperative mood, no period
**PRs**: <400 lines, pass CI, 1 approval, delete branch after merge
**Safety**: Never force push main. Never skip hooks. Use `--force-with-lease` on feature branches only.

---

## Checklist Gates

| Gate | Checklist |
|------|-----------|
| Before PR | pr-review |
| Before deploy | deployment-checklist |
| Security changes | security-audit |
| Build errors | build-errors-checklist |
| Database migrations | database-migration-review |

---

## Subagent Self-Correction

Subagents fix `.claude/` issues they encounter: broken refs in agent defs, outdated skill advice, inconsistencies. Report corrections for main agent to log to `.claude/user/changelog.md`.
