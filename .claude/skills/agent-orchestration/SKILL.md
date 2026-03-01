---
name: agent-orchestration
description: Quick-reference guide for the main agent's orchestration decisions. Covers the three-level dispatch framework, all 10 subagents, all 23 skills, parallel launch patterns, team vs. subagent selection, and cloud-session fallbacks.
---

# Agent Orchestration

Load with: `Skill("agent-orchestration")`

Quick-reference guide for the main agent's orchestration decisions. Covers the three-level dispatch framework, all 10 subagents, all 23 skills, parallel launch patterns, team vs. subagent selection, and cloud-session fallbacks.

---

## 1. Three-Level Decision Framework

Run through these levels top-to-bottom. Stop at the first YES.

### Level 1 — Main Agent Handles Directly

**YES if ALL of these are true:**
- Change is fewer than 10 lines
- No specialized domain knowledge required (auth, infra, DB schema, etc.)
- Simple bug fix or follows an existing, obvious pattern
- No architectural decisions involved

→ Code it yourself. No delegation.

---

### Level 2 — Subagents (one-shot, fire-and-forget)

**YES if ANY of these are true:**
- Specialist expertise is needed (security review, DB schema, OAuth, CI/CD, etc.)
- Two or more independent workstreams can run in parallel
- Task is focused and self-contained: a review, a research spike, a one-off generation

→ Use the **Agent tool** with the appropriate `subagent_type`.
→ Launch all independent subagents in **ONE message** (see Section 5).

Key properties of subagents:
- Fire-and-forget: they run, return a result, and terminate.
- They report back to the caller only — they do not message each other.
- Lower token cost than teams (results summarized back).
- Teammates inside an Agent Team CAN spawn subagents for isolated specialist work within their own scope.

---

### Level 3 — Agent Teams (persistent, coordinated)

**YES if ANY of these are true:**
- Parallel TDD across 2 or more REQs (use `/parallel-tdd`)
- Complex multi-file parallel implementation where teammates need to share interfaces or API contracts directly
- Work genuinely benefits from teammates messaging each other in real time

→ Use **TeamCreate** + **TaskCreate** + **SendMessage**.
→ Requires git worktrees for file isolation (one worktree per teammate).
→ Higher token cost — each teammate is a separate Claude instance.

Key properties of teams:
- Persistent: teammates stay alive, claim tasks from a shared list, message peers directly.
- Self-coordinating via the shared task list.
- Teammates CANNOT spawn nested teams.
- Default to messaging a peer over spawning a new subagent inside a team session.

---

## 2. Subagent Quick Reference

| Agent | Model | Use For | Delegate When |
|-------|-------|---------|---------------|
| **architect** | opus | System design, plans, trade-offs | Any architectural decision |
| **code-reviewer** | sonnet | PR reviews, security, TypeScript, tech debt | Before merging; security concerns |
| **test-writer** | sonnet | TDD, unit / integration / E2E / load tests | Writing test suites |
| **backend-specialist** | sonnet | REST API, DB schema, migrations | API design, database work |
| **auth-specialist** | sonnet | OAuth, JWT, MFA, sessions | Any auth implementation |
| **devops-specialist** | sonnet | CI/CD, Docker, IaC, monitoring | Infrastructure, build errors, deps |
| **frontend-specialist** | sonnet | Accessibility, i18n, Core Web Vitals | A11y, performance, i18n |
| **realtime-specialist** | sonnet | WebSockets, GraphQL, AI/ML | Real-time features, GraphQL, RAG |
| **mobile-specialist** | sonnet | React Native, Flutter | Mobile development |
| **doc-updater** | haiku | Documentation sync | Any doc update spanning 3+ files |

> For tasks needing no specialist, use `Task(prompt)` with `subagent_type: general-purpose` directly — no agent definition file needed.

**Model tiers (for custom Task calls):**
- haiku — doc-updater, Explore tasks
- sonnet — most agents, DEFAULT
- opus — architect, critical design decisions

**Delegation exception**: Even when a specialist exists, the main agent may handle the task directly if ALL of these hold: fewer than 10 lines, no domain knowledge needed, follows an existing pattern, no architecture involved.

---

## 3. Skills-First Table

**MANDATORY**: Before writing any code, call `Skill("name")` for each applicable row. Skills contain authoritative patterns that override general knowledge.

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
| LLM / AI Prompts | `Skill("prompt-engineering")` |
| RAG / Vector Search | `Skill("rag-patterns")` |
| Intent Routing | `Skill("user-intent-patterns")` |
| Dev Server Config | `Skill("dev-server-autoopen")` |
| Documentation | `Skill("documentation-patterns")` |
| Project Setup | `Skill("project-guidelines")` |

If no skill exists for a pattern you implement 2+ times, flag it as an EVOLVE observation in POST-TASK.

---

## 4. Cloud Session Adaptation

Git worktrees require a full local clone. They are unavailable in:
- Cloud-based Claude sessions
- CI / ephemeral environments
- Shallow git clones

**Detection**: run `git worktree add --detach .worktrees/probe HEAD 2>&1`. If it fails → use the fallback.

**Fallback for `/parallel-tdd` when worktrees are unavailable:**

1. Use parallel subagents (multiple Agent tool calls in one message).
2. Each subagent implements 1–2 REQs in the shared working directory.
3. Subagents coordinate by reading the spec — they CANNOT modify the same file simultaneously.
4. Assign non-overlapping file sets to each subagent before launch.
5. After all subagents complete, run `/checkpoint` as normal.

Note: the fallback loses the isolation guarantees of worktrees. Keep subagent file assignments strictly separate.

---

## 5. Parallel Launch Pattern

**CRITICAL RULE**: Launch all independent subagents in a single message containing multiple Agent tool calls.

- One Agent call per message = sequential execution (slow).
- Multiple Agent calls in one message = parallel execution (fast).

### Example — Feature with Auth + Backend + UI

User request: "Add a social login page with Google OAuth, a user profile API, and a profile settings UI."

**Wrong (sequential — 3x slower):**
```
Message 1: Task(auth-specialist, "implement Google OAuth")
Message 2: Task(backend-specialist, "user profile API")   ← waits for message 1
Message 3: Task(general-purpose, "profile settings UI")   ← waits for message 2
```

**Correct (parallel):**
```
Message 1 (single message, 3 Agent calls):
  Task(auth-specialist, "implement Google OAuth callback and session handling")
  Task(backend-specialist, "design and implement GET/PATCH /api/users/:id")
  Task(general-purpose, "build ProfileSettings React component (stub auth + API calls)")

Main agent (same turn): writes integration tests and wires routes together.
```

All three subagents run simultaneously. Main agent works in parallel on integration.

### What the main agent does while subagents run

Do not idle. Typical parallel work:
- Code the integration layer, routing, or layout that ties subagent outputs together.
- Write integration or E2E tests that cover the full flow.
- Update documentation for the feature.
- Prepare the PR description and checklist.

---

## 6. Intent Routing Quick-Reference

| User Says | Strategy | System |
|-----------|----------|--------|
| "Add a settings form" | Code directly | Level 1 |
| "Fix this null-pointer bug" | Debug and fix directly | Level 1 |
| "Review for security issues" | Delegate to code-reviewer (wait) | Level 2 subagent |
| "Check accessibility" | Delegate to frontend-specialist (wait) | Level 2 subagent |
| "Set up CI/CD pipeline" | Delegate to devops-specialist (wait) | Level 2 subagent |
| "Add dashboard with 3 widgets" | Parallel: delegate widgets, code layout | Level 2 subagents |
| "Add Google OAuth + profile API" | Parallel: auth-specialist + backend-specialist, code UI | Level 2 subagents |
| "Optimize slow dashboard" | Parallel: frontend-specialist + backend-specialist | Level 2 subagents |
| `/parallel-tdd` (2+ REQs) | Spec → team → worktrees → shared task list | Level 3 team |
| "Investigate from 3 angles" | Spawn teammates with competing hypotheses | Level 3 team |
| "Review PR from security, perf, test angles" | Spawn 3 review teammates | Level 3 team |

---

## 7. When NOT to Use Agent Teams

Teams have real token costs. Avoid them when:

- Tasks are sequential (B depends on A's output) — use subagents or code directly.
- Multiple agents would edit the same file — conflicts are unrecoverable without worktrees.
- The feature covers only 1–2 REQs — use `/tdd` (single-agent) instead.
- The task is purely research with no implementation — use a single Explore subagent.
- Tasks have many dependencies that require frequent re-coordination — prefer a single focused agent.

Rule of thumb: if you cannot divide the work into fully independent file sets, do not spawn a team.

---

## 8. Sequential Dependencies (Do Not Parallelize)

Some work must stay sequential. Respect these ordering constraints:

| Phase | Order |
|-------|-------|
| Planning → Implementation | architect output → wait → implement |
| Schema → Migrations | backend-specialist (schema) → wait → migration script |
| Implementation → Test suite | write code → wait → test-writer |
| Auth design → Auth implementation | auth-specialist (design) → wait → code |

When a task has a hard dependency, do not launch the downstream step until the upstream result is in hand.

---

## 9. Checklist Gates

Run the appropriate checklist before key transitions.

| Gate | Use |
|------|-----|
| Before PR | `pr-review` checklist |
| Before deploy | `deployment-checklist` |
| Security changes | `security-audit` checklist |
| Build errors | `build-errors-checklist` |
| Database migrations | `database-migration-review` checklist |

---

## Quick Decision Card

```
Is this < 10 lines, no domain expertise, no architecture?
  YES → Main agent handles directly.

Does it need a specialist OR can parts run in parallel?
  YES → Subagents (Agent tool, all in ONE message).

Does it need persistent teammates + worktree isolation?
  YES → Agent Team (TeamCreate + /parallel-tdd).

Are worktrees unavailable (cloud/CI)?
  → Fallback: parallel subagents with non-overlapping file assignments.

Launching subagents?
  → One message, multiple Agent calls. Never one call per message.

Starting any coding task?
  → Skill("name") FIRST. Check Section 3 for which skills to load.
```
