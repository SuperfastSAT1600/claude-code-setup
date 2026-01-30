# Task Execution Protocol (Mandatory)

**CRITICAL**: Every agent (main + subagents) MUST follow this protocol for every task. Non-optional.

---

## Phase 1: PRE-TASK (Before Any Coding)

### Checkpoint 1.1: Parallelization Analysis (REQUIRED)

**Question**: Can this task be split into independent parallel work?

**Decision tree**:
```
Does the task involve:
├─ Multiple independent files to create/modify? → YES, parallelize
├─ Multiple independent features/components? → YES, parallelize
├─ Multiple independent domains (auth + DB + API)? → YES, parallelize
├─ Research + implementation? → YES, parallelize (research while coding)
├─ Review of completed work? → YES, parallelize (multiple reviewers)
└─ Single atomic change? → NO, execute directly
```

**If YES** → You MUST:
1. Identify all independent parts
2. Launch parallel agents in ONE message (multiple Task calls)
3. Identify what YOU (main agent) will work on while agents run
4. Proceed immediately - don't wait idle

**If NO** → Proceed with single-track execution

**Accountability**: Document your parallelization decision:
```
PARALLELIZATION: [YES/NO]
REASON: [one line explanation]
IF YES:
  - Parallel work: [list what's delegated]
  - Main agent work: [what you'll do while they run]
```

---

## Phase 2: DURING TASK (While Working)

### Checkpoint 2.1: System Observation (REQUIRED)

While executing the task, note ANY issues in `.claude/` files you encounter:

**HEAL** (broken):
- [ ] Broken skill/agent references
- [ ] INDEX.md mismatches
- [ ] Contradictions between files
- [ ] Invalid paths in hooks/scripts

**EVOLVE** (missing):
- [ ] Task falls outside existing coverage
- [ ] Pattern repeated 3+ times (needs skill)
- [ ] Recurring error with no rule

**ADAPT** (outdated):
- [ ] Skill references deprecated tech
- [ ] Template contradicts current patterns
- [ ] Tech stack mismatch

**REFACTOR** (redundant):
- [ ] Overlapping skills/agents
- [ ] File >300 lines
- [ ] Unused components
- [ ] Duplicated rules

**Format**: Keep mental notes, don't interrupt the task.

---

## Phase 3: POST-TASK (After Task Completes)

### Checkpoint 3.1: Observation Report (REQUIRED)

**If observations noted** → Report using this format:
```
## System Observations

**HEAL**: [list broken items or "none"]
**EVOLVE**: [list gaps or "none"]
**ADAPT**: [list outdated items or "none"]
**REFACTOR**: [list redundancies or "none"]
```

**If no observations** → State: `OBSERVATIONS: none`

### Checkpoint 3.2: Auto-Healing (REQUIRED)

**Auto-apply immediately** (no approval needed):
- Regenerate INDEX.md to match filesystem
- Fix broken skill/agent references in frontmatter
- Fix obvious typos

**Propose for approval** (major changes):
- Update skill/agent content
- Modify rules/templates/workflows
- Create new components
- Archive unused components

**Never modify**:
- `.claude/settings.json`
- `setup.cjs`

### Checkpoint 3.3: Pattern Detection (AUTOMATIC)

**System automatically checks**:
- Error log in `CLAUDE.md` (same error 2+ times?)
- Changelog in `.claude/health/changelog.md` (same issue 2+ times?)

**If pattern detected** → Auto-apply fix:
1. Identify the skill/agent/rule that should prevent this error
2. Update it with the correct pattern
3. Log to changelog as `heal(auto): [description]`
4. Notify user: "Auto-healed recurring pattern: [what was fixed]"

### Checkpoint 3.4: Logging (REQUIRED)

**If any system changes made**:
```bash
# Log to changelog
echo "## [$(date +%Y-%m-%d)] type(scope): description
- **Type**: heal|evolve|adapt|refactor
- **Changed**: [files]
- **Reason**: [why]
" >> .claude/health/changelog.md

# Commit separately from task work
git add .claude/
git commit -m "heal(scope): description" # or evolve/adapt/refactor
```

**If main agent made an error during task**:
- Append concise entry to Error Log in `CLAUDE.md`
- Format: `- [what went wrong and correct approach]`

---

## Subagent Protocol

**Additional requirements for subagents**:

1. **Report fixes in response**: Any `.claude/` files fixed must be listed in final response
2. **Structured output**: Use this template in response:
   ```
   ## Task Result
   [your work]

   ## System Fixes Applied
   - Fixed: [file] - [what was wrong]
   - Updated: [file] - [why]
   ```

3. **Accountability**: Main agent logs your fixes to changelog

---

## Enforcement

**This protocol is MANDATORY**. If you skip any checkpoint:
- You are violating system rules
- The system cannot self-improve
- Errors will repeat and work will be duplicated

**Token cost**: ~20-30 tokens per task for checkpoints
**Benefit**: Eliminates recurring errors, maximizes parallelization, maintains system health

---

## Quick Reference Card

```
BEFORE TASK:
✓ Can this be parallelized? [YES/NO + reason]
✓ If YES: What runs parallel? What do I work on?

DURING TASK:
✓ Note .claude/ issues mentally (don't stop working)

AFTER TASK:
✓ Report observations [heal/evolve/adapt/refactor or "none"]
✓ Auto-apply trivial fixes, propose major changes
✓ Check for error patterns (auto-healed if detected)
✓ Log all changes to changelog
✓ If I made error: add to CLAUDE.md Error Log
```
