# Task Execution Protocol (Mandatory)

Every agent MUST follow this protocol. See `self-improvement.md` for error categories, patterns, triggers.

---

## Phase 0: INIT

**FIRST ACTION (MANDATORY)**: Use the Read tool to read `.claude/user/errors.md` (main agent) or `.claude/user/agent-errors/{name}.md` (subagent). This MUST be your first task upon loading.

**LOAD SKILLS**: Check orchestration.md Skills-First table for skills to load.

**PRD** (core features): `docs/PRD.md` for scope, architecture, metrics

---

## Phase 1: PRE-TASK

### Delegation Check

Specialist needed? → See **orchestration.md → Intent Routing** for full decision logic and specialist mapping.

**Exception** (handle directly): <10 lines, no domain knowledge, follows an existing pattern, no architecture involved.

### Parallelization

See **orchestration.md → Intent Routing** for full parallel/sequential decision logic.

### Task List (MANDATORY)

**Create task list for**:
- Multi-step tasks (3+ steps)
- Non-trivial complex tasks
- User provides multiple tasks
- Plan mode work

**Skip for**: Single straightforward tasks, trivial tasks (<3 steps), conversational requests

**Mark tasks**: `in_progress` when starting, `completed` when done

---

## Phase 2: DURING

**Error Logging (immediate, non-blocking)**: Error → STOP → LOG → THEN continue
- Log immediately: `.claude/user/errors.md`: `[category] Error: [what] | Correct: [how]`
- Logging is required but does NOT block user's work — log it and keep going
- Self-check: "Did I log it?" If no → LOG NOW, then continue
- Only STOP permanently when the error prevents all meaningful progress (e.g., blocked on missing credentials, broken environment)

**Observations** (note mentally): HEAL (broken refs), EVOLVE (missing coverage), ADAPT (deprecated tech), REFACTOR (bloat)

---

## Phase 3: POST-TASK

1. **Verify** (MANDATORY before anything else): Close the verification loop — see **orchestration.md → Verification Loop**. Do not proceed to step 2 until the work is confirmed working.
2. **Report**: `OBSERVATIONS: [items or "none"]`
3. **Auto-heal**: Auto (INDEX, refs, typos) or Propose (content, components)
4. **Verify errors logged** (from immediate logging)
5. **Changelog** (self-initiated only)
6. **Docs** (MANDATORY for code): Feature → README/API/changelog | API change → docs/examples/changelog | Bug → changelog/examples | Refactor → affected docs | Small (1-2 files) = direct, Large (3+) = doc-updater

---

## Subagent Protocol

**Before returning results**: Verify your own workstream — run your piece's tests, confirm your endpoint responds, check your migration applied. Do not return until your scope is confirmed working.

**Self-correction**: Fix any `.claude/` issues you encounter (broken refs, outdated skill advice, inconsistencies). Report corrections in your result for the main agent to log to `.claude/user/changelog.md`.

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
INIT:    Read errors.md FIRST → Load relevant skills → PRD
PRE:     Delegate? Parallel? Task list?  (see orchestration.md)
DURING:  Error → LOG (immediate, non-blocking) → continue
POST:    VERIFY → Observations → Heal → Errors → Changelog → DOCS
```
