# Task Execution Protocol (Mandatory)

**CRITICAL**: Every agent (main + subagents) MUST follow this protocol for every task.

For detailed guidance on error categories, pattern detection, and enhancement triggers, see `self-improvement.md`.

---

## Phase 0: INIT

**Read error logs first** to avoid known issues:
- Main agent: `.claude/user/errors.md`
- Subagents: Also read `.claude/user/agent-errors/{your-name}.md`

**Check Skills** (MANDATORY):
- Identify relevant skills for the task domain
- Load ALL applicable skills before starting work
- Skills contain authoritative patterns - use them instead of guessing

**Available skill domains**:
- auth-patterns, backend-patterns, coding-standards, database-patterns
- docker-patterns, documentation-patterns, frontend-patterns, github-actions
- graphql-patterns, nextjs-patterns, nodejs-patterns, prompt-engineering
- rag-patterns, react-patterns, rest-api-design, tdd-workflow
- user-intent-patterns, websocket-patterns, skill-creator

**Error to avoid**: `[context] Error: Didn't use available skill | Should have loaded: [skill-name]`

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

### 3.5 Documentation Update (MANDATORY)

**CRITICAL**: Every code change MUST update documentation.

**Decision Tree**:
```
Did you change code?
├─ Added feature → Update README, API docs, changelog
├─ Changed API → Update function docs, README examples, changelog
├─ Fixed bug → Update changelog, affected examples
├─ Refactored → Update affected docs
└─ No code change → Skip this step
```

**How to Update**:
- **Small changes** (1-2 files): Update docs directly
- **Large changes** (3+ files): Delegate to `doc-updater` agent
- **Parallel option**: If multiple independent docs, update in parallel with main work

**What to Update**:
1. **API Documentation**: JSDoc/TSDoc for changed functions
2. **README**: Usage examples if API changed
3. **Changelog**: Add entry (`.claude/user/changelog.md` for self-initiated OR project changelog for user requests)
4. **Comments**: Inline docs for complex logic
5. **Examples**: Code samples that reference changed code

**Verification**:
- [ ] All changed functions have current docs
- [ ] Examples still work
- [ ] Changelog updated
- [ ] No outdated references

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
INIT:    Read errors.md (subagents: also agent-errors/{name}.md) + CHECK SKILLS
PRE:     Parallelizable? [YES/NO]
DURING:  Note issues + failures mentally
POST:    Report → Auto-heal → Log errors → Log self-initiated changes → UPDATE DOCS
```
