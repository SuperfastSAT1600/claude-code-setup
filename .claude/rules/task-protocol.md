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

### Error Logging (IMMEDIATE)

**CRITICAL**: Log errors to `.claude/user/errors.md` IMMEDIATELY when they occur. Do NOT wait until end of task.

```
Tool fails → LOG NOW → Continue
Code error → LOG NOW → Fix → Continue
Wrong assumption → LOG NOW → Correct → Continue
```

### System Observations (note mentally)

Note system improvement opportunities for reporting at end:
1. **HEAL**: Broken references, contradictions, invalid paths
2. **EVOLVE**: Missing coverage, new patterns, recurring needs
3. **ADAPT**: Deprecated tech, stack mismatches, preference changes
4. **REFACTOR**: Overlaps, bloat, unused components

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

### 3.3 Error Logging (Final Check)

**Verify all errors were logged during task** (should already be in files from immediate logging):
- Main agent errors → `.claude/user/errors.md`
- Subagent errors → `.claude/user/agent-errors/{agent-name}.md`

If any were missed, log them now.

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
DURING:  LOG ERRORS IMMEDIATELY + note system observations mentally
POST:    Report observations → Auto-heal → Verify errors logged → Log self-initiated changes → UPDATE DOCS
```
