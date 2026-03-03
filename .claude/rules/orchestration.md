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
Task scope?
├─ Simple (< ~10 lines, no specialist) → Main agent directly
├─ Needs specialist OR 2–3 independent parts → Subagents (default)
│    ├─ Specialist review/audit/research? → 1 subagent (wait)
│    └─ Independent parallel parts? → Multiple Task calls in one message
└─ Large-scale (4+ workstreams, workers need ongoing coordination) → Agent Team
     ├─ "Build a complete X" spanning 3+ domains → Team
     └─ Spec with 5+ Must-priority REQs across domains → Team via /parallel-tdd
```

**Default to subagents.** Agent Teams only when the coordination overhead is justified by genuine parallel build complexity.

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
| LLM/AI Prompts | `Skill("prompt-engineering")` |
| RAG/Vector Search | `Skill("rag-patterns")` |
| Intent Routing | `Skill("user-intent-patterns")` |
| Dev Server Config | `Skill("dev-server-autoopen")` |

---

## Intent Routing

**Do not wait for explicit commands or special user phrasing.** Read the task, analyze its scope, and apply the decision logic below automatically.

### Decision Logic

**Main agent handles directly:**
- Fewer than ~10 lines changed, single domain, clear pattern, no specialist needed

**Subagents (default parallel system):**
- Specialist expertise needed (auth, devops, DB schema, security audit, etc.)
- 2–3 independent workstreams that can run simultaneously
- Each workstream is self-contained — no ongoing back-and-forth between workers needed
- Reviews, audits, research spikes, schema design, CI config (always subagents — fire-and-forget)

**Agent Teams (reserve for genuinely large parallel work):**
- 4+ concurrent implementation workstreams across distinct domains
- Workers need to negotiate shared interfaces or API contracts *as they build*, not just upfront
- Greenfield or near-greenfield feature spanning 3+ domains (auth + backend + frontend + DB + tests) simultaneously
- Spec with 5+ Must-priority REQs distributed across domains

### Auto-Detection Signals

**Signals → Agent Teams:**
- "Build a complete X" / "Build the entire X" / "Full [system/feature]"
- Multiple services mentioned together: "users, orders, payments, notifications"
- Task explicitly touches auth + API + frontend + DB all at once
- Spec has 5+ Must-priority REQs across different domains

**Signals → Subagents (default):**
- "Add X" / "Fix X" / "Review X" / "Set up X" / "Optimize X"
- Additive work on existing code (not greenfield)
- 1–2 specialist areas (auth + backend, frontend + performance)
- Review, audit, research, documentation — always subagents

### Routing Table

| Task | Strategy | System |
|------|----------|--------|
| "Fix this bug" | Main agent | — |
| "Add a settings form" | Main agent | — |
| "Review for security" | Subagent: code-reviewer | Wait |
| "Check accessibility" | Subagent: frontend-specialist | Wait |
| "Set up CI/CD" | Subagent: devops-specialist | Wait |
| "Add OAuth login" | Parallel subagents: auth-specialist + backend-specialist; main codes UI | Subagents |
| "Add a dashboard with 3 widgets" | Parallel subagents per widget; main codes layout | Subagents |
| "Optimize slow dashboard" | Parallel subagents: frontend-specialist + backend-specialist | Subagents |
| "Add RAG search" / "Integrate LLM" | Subagent: ai-specialist | Wait |
| "Build a complete checkout / auth system / social feed / CMS" | Agent Team — frontend, backend, auth, DB, tests in parallel worktrees | Team |
| Spec with 5+ Must-priority REQs across domains | Agent Team via `/parallel-tdd` | Team |
| "Refactor [large cross-cutting system]" | Assess file isolation: isolated → parallel subagents; shared interfaces evolving → Team | Either |

---

## Verification Loop (All Routes)

**Writing code is not done. Done means confirmed working.**

After any implementation — regardless of which route was used — verify the output actually works before reporting completion. If verification fails, fix and re-verify. Only stop when everything passes.

### When a Spec Is Active

Spec verification tags are authoritative. Use them, not the heuristic table below.

| Tag | What "verified" means |
|-----|-----------------------|
| **(TEST)** | The REQ's test passes. TDD's Green phase is the verification — no extra step. |
| **(BROWSER)** | The Playwright E2E test passes. Use Playwright MCP for diagnosis during development, not as the gate. |
| **(MANUAL)** | Flag for the user and continue. Do not block completion on it. |

### What to Verify (No Spec — Ad-Hoc Tasks)

When there is no active spec, use these heuristics:

| Work Type | Verification Steps |
|-----------|-------------------|
| **UI / frontend** | Run tests → Playwright MCP spot-check in browser → check for console errors |
| **Backend / API** | Run tests → call the endpoint (curl/fetch) and inspect the real response |
| **Database / migrations** | Run migration → query the table → confirm schema matches intent |
| **DevOps / CI / config** | Run the pipeline/script → read actual output → check for errors or warnings |
| **Auth** | Run tests → exercise the full login/logout flow in a real request |
| **Any code change** | At minimum: run the relevant test suite and confirm it passes |

### Per-Route Responsibility

**Main agent (direct):** Verify in the same context. Run tests, use Playwright MCP for UI, call APIs with curl. If something fails, fix it and re-run before considering the task done.

**Subagents:** Each subagent verifies its own workstream before returning results (run its piece's tests, confirm its endpoint responds, etc.). After all subagents complete, the main agent runs an integration verification pass — tests, a smoke check, or `/checkpoint`. If anything is off, fix it directly or re-delegate the failing piece.

**Agent Teams:** Each teammate verifies their own REQs before marking the task complete on the shared list. The team lead runs `/checkpoint` as the final gate before closing the session. If checkpoint fails, the lead re-assigns failing items.

### The Loop

```
implement → verify → pass? → done
                   → fail? → fix → verify again
```

Never report "done" after implement. Always close the loop.

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

