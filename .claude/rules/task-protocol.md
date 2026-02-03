# Task Execution Protocol (Mandatory)

**CRITICAL**: Every agent (main + subagents) MUST follow this protocol for every task.

For detailed guidance on error categories, pattern detection, and enhancement triggers, see `self-improvement.md`.

---

## Phase 0: INIT

**Read error logs first** to avoid known issues:
- Main agent: `.claude/user/errors.md`
- Subagents: Also read `.claude/user/agent-errors/{your-name}.md`

---

## Phase 1: PRE-TASK

### Parallelization Analysis

**Question**: Can this be parallelized?

```
Multiple independent files/features/domains? → YES
Research + implementation? → YES
Review of completed work? → YES
Single atomic change? → NO
```

**If YES**: Launch parallel agents in ONE message, identify what YOU work on while they run.

See `orchestration.md` for patterns and examples.

---

## Phase 2: DURING

### Observe & Track (mentally, don't stop working)

1. **System issues** in `.claude/` files (heal/evolve/adapt/refactor)
2. **Failures** in any of the 6 categories (see `self-improvement.md`)

---

## Phase 3: POST-TASK

### 3.1 Report Observations

```
OBSERVATIONS: [heal/evolve/adapt/refactor items, or "none"]
```

### 3.2 Auto-Healing

Per `self-improvement.md`:
- **Auto-apply**: INDEX sync, broken references, typos
- **Propose**: Content changes, new components

### 3.3 Error Logging

**Main agent** logs ALL errors (including those reported by subagents):
- Main agent errors → `.claude/user/errors.md`
- Subagent errors → `.claude/user/agent-errors/{agent-name}.md`

Format: `- [category] Error: [what] | Correct: [how]`

### 3.4 Changelog (self-initiated only)

Only log changes Claude proposed (not user requests). See `self-improvement.md` for format.

---

## Subagent Protocol

Subagents **report** errors and fixes in their response (main agent logs them):

```
## Task Result
[your work]

## Errors Encountered
- [category] Error: [what] | Correct: [how]
(or "none")

## System Fixes Applied
- Fixed: [file] - [what was wrong]
(or "none")
```

---

## Quick Reference

```
INIT:    Read errors.md (subagents: also agent-errors/{name}.md)
PRE:     Parallelizable? [YES/NO]
DURING:  Note issues + failures mentally
POST:    Report → Auto-heal → Log errors → Log self-initiated changes
```
