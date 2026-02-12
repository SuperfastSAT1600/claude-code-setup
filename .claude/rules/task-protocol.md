# Task Execution Protocol (Mandatory)

Every agent MUST follow this protocol. See `self-improvement.md` for error categories, patterns, triggers.

---

## Phase 0: INIT

**Errors**: Main → `.claude/user/errors.md`, Subagents → also `.claude/user/agent-errors/{name}.md`
**PRD** (core features): `docs/PRD.md` for scope, architecture, metrics
**Skills** (MANDATORY): Identify + load ALL before work. Skills = authoritative patterns. Error: `[context] Error: Didn't use available skill | Should have loaded: [skill]`

**Domains**: auth-patterns, backend-patterns, database-patterns, docker-patterns, documentation-patterns, frontend-patterns, github-actions, graphql-patterns, nextjs-patterns, nodejs-patterns, prompt-engineering, rag-patterns, react-patterns, rest-api-design, tdd-workflow, user-intent-patterns, websocket-patterns

---

## Phase 1: PRE-TASK

### Delegation Check

Specialist required? Check `orchestration.md`:
Database → database-architect, migration-specialist | API → api-designer, graphql-specialist | Auth → auth-specialist | Security → security-reviewer | Testing → unit-test-writer, integration-test-writer, e2e-runner | Infrastructure → docker-specialist, ci-cd-specialist | Code review → code-reviewer | Performance → performance-optimizer

**If specialist exists: DELEGATE. Exception**: <10 lines, no domain knowledge, follows patterns, no architecture.

### Parallelization

Independent files/features/domains? → PARALLEL (one message, multiple Tasks)
Research + implementation? → PARALLEL | Review? → PARALLEL | Single atomic? → SEQUENTIAL

---

## Phase 2: DURING

**Error Logging (BLOCKING)**: Error → STOP → LOG → VERIFY → THEN continue
Log: `.claude/user/errors.md`: `[category] Error: [what] | Correct: [how]`
Self-check: "Did I log it?" If no → LOG NOW

**Observations** (note mentally): HEAL (broken refs), EVOLVE (missing coverage), ADAPT (deprecated tech), REFACTOR (bloat)

---

## Phase 3: POST-TASK

1. **Report**: `OBSERVATIONS: [items or "none"]`
2. **Auto-heal**: Auto (INDEX, refs, typos) or Propose (content, components)
3. **Verify errors logged** (from immediate logging)
4. **Changelog** (self-initiated only)
5. **Docs** (MANDATORY for code): Feature → README/API/changelog | API change → docs/examples/changelog | Bug → changelog/examples | Refactor → affected docs | Small (1-2 files) = direct, Large (3+) = doc-updater

---

## Subagent Protocol

Report (main logs):
```
## Task Result
[work]
## Errors Encountered
[category] Error: [what] | Correct: [how]
## System Fixes Applied
Fixed: [file] - [what]
```

---

## Quick Reference

```
INIT:    errors + PRD + SKILLS
PRE:     Delegate? Parallel?
DURING:  Error → STOP → LOG → VERIFY → THEN
POST:    Observations → Heal → Errors → Changelog → DOCS
```
