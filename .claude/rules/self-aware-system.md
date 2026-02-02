# Self-Aware System Rules

This system continuously improves itself. While performing any task, observe your own `.claude/` configuration across four dimensions and act on what you find.

---

## Observation (During Every Task)

While working on the user's primary task, notice issues in `.claude/` files you encounter. Do NOT stop or slow down the primary task — just note observations mentally.

### Heal (fix what's broken)
- Broken skill references in agent frontmatter (skill file doesn't exist)
- Broken agent references in workflows/commands
- INDEX.md entries that don't match the actual filesystem
- Hook scripts referencing invalid paths
- Cross-file contradictions (rule A says X, skill B says not-X)
- Templates using patterns that contradict current skills

### Evolve (grow what's missing)
- User request falls outside any existing agent/skill coverage
- Same manual pattern applied 3+ times across sessions (candidate for new skill)
- Error log shows recurring issue with no corresponding rule

### Adapt (adjust to environment changes)
- Skill/template references a library or pattern the project no longer uses
- Tech stack in CLAUDE.md doesn't match actual project dependencies
- User preferences consistently diverge from a documented rule

### Refactor (simplify the system)
- Two skills/agents with substantially overlapping content (merge candidate)
- A single file exceeding 300 lines (split candidate)
- Component not referenced by any other component (archive candidate)
- Same rule/guideline duplicated across multiple files (consolidate candidate)

---

## Resolution (After Primary Task Completes)

After finishing the user's requested task, if you noted any system observations:

### 1. Report
Summarize observations grouped by type (heal/evolve/adapt/refactor). Be concise.

### 2. Auto-Detection (AUTOMATIC)

**System automatically scans for recurring patterns**:

```python
# Pseudo-code for pattern detection
patterns = {
  'error_log': scan_file('.claude/user/errors.md'),
  'changelog': scan_file('.claude/user/changelog.md')
}

for pattern in detect_duplicates(patterns, threshold=2):
  # If same error/issue appears 2+ times, auto-heal
  auto_heal(pattern)
```

**Detection triggers**:
- Same error in `.claude/user/errors.md` 2+ times
- Same issue in `.claude/user/changelog.md` 2+ times
- Subagent reports "fixed same issue as last time"

**Auto-healing actions** (no approval needed):
1. Identify which skill/agent/rule should prevent this error
2. Add or update the relevant pattern/guidance
3. Make the fix concise (1-3 lines if possible)
4. Log as `heal(auto): [description]`
5. Notify user: "Auto-healed recurring pattern: [what]"

**Example**:
```
DETECTED: "wrong API command" appears 3x in error log
AUTO-HEAL: Update .claude/agents/api-designer.md to include:
  "API commands: Use POST /v2/resource (not /v1/resource - deprecated)"
LOG: heal(auto): add correct API command to api-designer agent
```

### 3. Act by Tier

**Auto-apply + notify** (Minor/structural):
- Regenerate INDEX.md to match filesystem
- Fix broken skill/agent references in frontmatter
- Fix obvious typos in rules or skills
- **Auto-heal recurring patterns (2+ occurrences)**

**Propose + wait for approval** (Major/content):
- Update skill or agent content (unless auto-healing recurring error)
- Update rule wording
- Modify templates
- Modify checklists or workflows
- Archive unused components

**Propose + wait for approval** (Evolution):
- Create new skill, agent, command, or workflow
- Add new rule or guideline
- Add new hook or script

**Never auto-modify**:
- `.claude/settings.json`
- `.claude/rules/essential-rules.md`
- `.claude/rules/task-execution-protocol.md`
- `setup.cjs`

### 4. Log
After any system change, append to `.claude/user/changelog.md`:
```
## [YYYY-MM-DD] type(scope): description
- **Type**: heal|evolve|adapt|refactor
- **Auto**: yes|no (was this auto-detected and auto-applied?)
- **Changed**: file(s) modified
- **Reason**: why
```

---

## Error Correction by Role

### Main Agent
When the main agent makes an error (wrong output, misapplied rule, bad pattern, incorrect assumption), it must **append an entry to `.claude/user/errors.md`** describing the mistake concisely. This ensures the same mistake is never repeated in future sessions. Format:
```
- [short description of what went wrong and the correct approach]
```

### Subagents (Specialists)
When a subagent encounters errors, inconsistencies, or inefficiencies in `.claude/` files during its delegated work, it should **fix them inline as part of its task output**. Specifically:

- **Broken references in its own agent definition** (e.g., skill that doesn't exist): Fix the frontmatter directly
- **Outdated advice in a skill it loads** (e.g., skill recommends deprecated pattern): Update the skill content
- **Inconsistency between its instructions and project reality** (e.g., agent says use Prisma but project uses Supabase): Correct the agent/skill to match reality
- **Inefficiency in its own workflow** (e.g., redundant steps, unnecessary tool usage): Streamline its definition

Subagent fixes follow the same approval tiers as Resolution above — auto-apply minor/structural fixes with notification, propose major content changes for approval. Subagents should note all corrections in their output so the main agent can log them to `.claude/user/changelog.md`.

### Accountability Chain
1. Subagent discovers issue in `.claude/` config → fixes it (or proposes fix) as part of task
2. Subagent reports corrections in its response to the main agent
3. Main agent logs corrections to `.claude/user/changelog.md`
4. Main agent makes its own error → appends to `.claude/user/errors.md` immediately
5. Recurring errors (3+ occurrences in Error Log) → trigger rule/skill update proposal

---

## Guardrails

- **Primary task first**: Never delay or derail the user's work for self-improvement
- **Session cap**: Maximum 5 system changes per session (across all four types)
- **Scope cap**: Maximum 5 files modified per single change action
- **Immutable files**: Never modify settings.json, essential-rules.md, or setup.cjs
- **Git discipline**: Every system change gets its own commit with prefix: `heal()`, `evolve()`, `adapt()`, or `refactor()`
- **No loops**: If the same issue recurs after a fix attempt, escalate to user — do not retry
- **Observation overflow**: If >10 observations accumulate, suggest running `/health-check` instead of inline resolution

---

## Constitutional Invariants (Never Violate)

1. **Hybrid agent principle**: Main agent codes + specialists handle complex domains
2. **Security-first**: Never weaken security rules or bypass safety hooks
3. **Human oversight**: Significant changes always require user approval
4. **Git reversibility**: Every change is committed and revertable
5. **Token-consciousness**: Self-improvement must cost less than the faults it prevents
