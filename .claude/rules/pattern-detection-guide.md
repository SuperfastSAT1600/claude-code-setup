# Pattern Detection Guide

How to detect and auto-heal recurring errors in the self-aware system.

---

## Detection Sources

### 1. Error Log (`.claude/user/errors.md`)

**Location**: `.claude/user/errors.md`

**Format**:
```
## Error Log

Main agent: append here when you make a mistake...

- Never pass model parameter to Task unless explicitly requested
- Always use correct API v2 endpoints, not deprecated v1
- [other errors...]
```

**Detection logic**:
- Scan all entries in Error Log
- Group by semantic similarity (not exact match)
- Flag if 2+ entries describe the same type of mistake

**Examples of patterns**:
- Multiple entries about "wrong API version"
- Multiple entries about "incorrect tool parameter"
- Multiple entries about "missed parallelization opportunity"

### 2. Changelog (`.claude/user/changelog.md`)

**Location**: `.claude/user/changelog.md`

**Format**:
```
## [YYYY-MM-DD] type(scope): description
- **Type**: heal|evolve|adapt|refactor
- **Changed**: file(s) modified
- **Reason**: why
```

**Detection logic**:
- Scan all entries from the last 30 days
- Group by scope/reason semantic similarity
- Flag if 2+ entries are healing the same issue

**Examples of patterns**:
- Multiple `heal(auth-specialist)` entries fixing same reference
- Multiple `heal(database-architect)` entries adding same guidance
- Multiple `heal(api-designer)` entries correcting same pattern

### 3. Subagent Reports

**Source**: Subagent responses to main agent

**Format**:
```
## System Fixes Applied
- Fixed: .claude/agents/api-designer.md - wrong API version referenced
- Updated: .claude/skills/rest-api-design.md - added correct endpoints
```

**Detection logic**:
- Track what each subagent reports fixing
- If same subagent fixes same issue 2+ times across sessions → pattern

---

## Pattern Recognition (Semantic)

**Don't require exact matches**. Use semantic similarity:

**Same pattern** (should trigger):
```
Error Log entry 1: "Never pass model parameter to Task unless explicitly requested"
Error Log entry 2: "Avoid passing model to Task tool - not needed for standard cases"
→ MATCH: Both about incorrect model parameter usage
```

**Different patterns** (should not trigger):
```
Error Log entry 1: "Never pass model parameter to Task"
Error Log entry 2: "Always validate user input for XSS"
→ NO MATCH: Completely different issues
```

**Threshold**: 2+ occurrences = pattern detected

---

## Auto-Healing Actions

### Step 1: Identify Root Cause

For detected pattern, ask:
1. Which `.claude/` file(s) should prevent this error?
2. What guidance is missing or unclear?

**Examples**:
| Pattern | Root Cause | Target File |
|---------|-----------|-------------|
| "Wrong API v1 used instead of v2" | API spec outdated | `.claude/agents/api-designer.md` or `.claude/skills/rest-api-design.md` |
| "Missed parallelization" | Protocol not followed | `.claude/rules/task-execution-protocol.md` already exists, add reminder to `.claude/rules/agent-workflow.md` |
| "Incorrect auth pattern" | Auth guidance incomplete | `.claude/agents/auth-specialist.md` or `.claude/skills/auth-patterns.md` |

### Step 2: Generate Concise Fix

**Concise = 1-5 lines of guidance**

**Good fixes** (concise):
```markdown
## API Endpoints (Updated 2026-01-30)
- Use `/api/v2/*` endpoints (v1 deprecated as of 2025-12)
- Auth: POST /api/v2/auth/login (not /api/v1/login)
```

**Bad fixes** (too verbose):
```markdown
## API Endpoints

The system has been upgraded to version 2 of the API. As of December 2025,
version 1 is deprecated and should not be used. When implementing authentication,
you should use the new v2 endpoint which is located at /api/v2/auth/login.
The old endpoint was at /api/v1/login but this is no longer supported...
[continues for 20 more lines]
```

**Where to add**:
- If section exists → append to it
- If section doesn't exist → create new section with heading
- Keep related guidance together

### Step 3: Apply + Log + Notify

**Apply**:
```bash
# Edit the target file with the concise fix
Edit(file_path=target_file, old_string=existing_section, new_string=updated_section)
```

**Log**:
```markdown
## [2026-01-30] heal(auto): correct API endpoints in api-designer agent
- **Type**: heal
- **Auto**: yes
- **Changed**: .claude/agents/api-designer.md
- **Reason**: Error log showed 3 instances of using deprecated v1 API
- **Pattern**: "wrong API version" detected via error log analysis
```

**Notify user**:
```
Auto-healed recurring pattern: Updated api-designer agent with correct v2 API endpoints
(detected 3 instances of v1 usage in error log)
```

---

## Detection Workflow (Step-by-Step)

**Run this after completing user's task** (as part of POST-TASK checkpoint):

```
1. Scan .claude/user/errors.md
   → Extract all entries
   → Group semantically similar entries
   → If any group has 2+ entries → Pattern detected

2. Scan .claude/user/changelog.md (last 30 days)
   → Extract all "heal" entries
   → Group by scope/reason similarity
   → If any group has 2+ entries → Pattern detected

3. For each detected pattern:
   a. Identify target file (which agent/skill/rule should prevent this?)
   b. Generate concise fix (1-5 lines of guidance)
   c. Apply fix to target file
   d. Log to changelog with "Auto: yes"
   e. Notify user

4. If no patterns detected:
   → Continue with normal observation reporting
```

---

## Examples

### Example 1: API Version Error

**Error Log** (.claude/user/errors.md):
```
- Used deprecated /api/v1/users endpoint instead of /api/v2/users
- API v1 called when v2 is required - update agent knowledge
- Wrong API version in implementation (v1 vs v2)
```

**Detection**: 3 entries about "wrong API version"

**Auto-heal**:
1. Target: `.claude/agents/api-designer.md`
2. Fix:
   ```markdown
   ## API Versions
   - **Current**: v2 (use `/api/v2/*`)
   - **Deprecated**: v1 (do not use, removed Dec 2025)
   ```
3. Log: `heal(auto): add API version guidance to api-designer`
4. Notify: "Auto-healed: Added v2 API requirement (3 v1 usage errors detected)"

### Example 2: Parallelization Missed

**Changelog**:
```
## [2026-01-28] heal(workflow): add parallelization reminder
- Main agent didn't parallelize independent widgets

## [2026-01-29] heal(workflow): emphasize parallel execution
- Sequential execution when parallel was possible
```

**Detection**: 2 entries about "parallelization not happening"

**Auto-heal**:
1. Target: `.claude/rules/agent-workflow.md`
2. Fix: Already has extensive guidance, but maybe add to top:
   ```markdown
   ⚠️ **FIRST QUESTION FOR EVERY TASK**: "Can this be parallelized?" [YES/NO]
   ```
3. Log: `heal(auto): add mandatory parallelization checkpoint to agent-workflow`
4. Notify: "Auto-healed: Strengthened parallelization requirement (2 missed opportunities detected)"

### Example 3: Incorrect Hook Usage

**Error Log**:
```
- Pre-commit hook failed - forgot to stage files before commit
- Pre-commit hook error - files not staged
```

**Detection**: 2 entries about "hook failed - staging issue"

**Auto-heal**:
1. Target: `.claude/rules/agent-workflow.md` (Git Workflow section)
2. Fix:
   ```markdown
   ### Commit Checklist
   1. Stage files: `git add <files>` (NEVER `git add -A`)
   2. Run commit: `git commit -m "..."`
   3. Hooks run automatically - if they fail, check staged files
   ```
3. Log: `heal(auto): add git staging reminder to workflow`
4. Notify: "Auto-healed: Added commit staging checklist (2 hook failures detected)"

---

## Guardrails

1. **Only auto-heal if pattern is clear** (2+ occurrences, semantically similar)
2. **Keep fixes concise** (1-5 lines, not essays)
3. **Never remove existing content** (only add or clarify)
4. **Never modify immutable files** (settings.json, essential-rules.md, task-execution-protocol.md, setup.cjs)
5. **Always log with "Auto: yes"** so it's auditable
6. **Always notify user** so they're aware of what changed
7. **If unsure** → Propose instead of auto-applying

---

## Integration with Task Execution Protocol

This pattern detection runs **automatically** as part of:
- **Checkpoint 3.3** in `task-execution-protocol.md`
- Executes during POST-TASK phase
- Runs AFTER observation reporting but BEFORE final logging
- No user interaction needed unless proposing major changes
