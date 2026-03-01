# Self-Improvement System

Continuously improve through aggressive error logging, pattern detection, and proactive enhancement.

---

## 1. Error Logging (Aggressive)

**Threshold**: If didn't work as expected, LOG IT. Over-logging > missing patterns.

### 6 Failure Categories

| Category | Examples | Format |
|----------|----------|--------|
| Tool/API | MCP errors, WebFetch fails, API errors, Bash failures | `[tool] Error: [what] \| Expected: [expected]` |
| Code | Syntax/type/import errors, security vulnerabilities | `[code] Error: [what] \| Correct: [how]` |
| Command | Wrong syntax, permissions, Git/package manager errors | `[cmd] Error: [failed] \| Correct: [working]` |
| Context | Misunderstood intent, wrong file, assumptions, didn't use skill | `[context] Error: [assumption] \| Reality: [actual]` |
| Agent | Wrong agent, unhelpful results, missed parallelization | `[agent] Error: [what] \| Better: [approach]` |
| Config | Non-existent file, broken refs, outdated patterns | `[config] Error: [broken] \| Fix: [how]` |

**Where**: Main → `.claude/user/errors.md`, Subagents → `.claude/user/agent-errors/{agent-name}.md`

**Verification**: Hook blocks Edit/Write/Task/Bash until errors.md read. Timeout: 5 min. See `.claude/docs/error-verification-system.md`.

**When**: Tool error / Code error / Command failed / Wrong assumption / Didn't check skill / Subagent didn't help / Retry / User corrected / Found outdated info / User shared error → **LOG IT**

---

## 2. Observation Framework

Note improvements while working. Report at end. Don't delay user's work.

- **HEAL**: Broken refs, contradictions, invalid paths
  - Broken skill references in agent frontmatter (skill file doesn't exist)
  - Broken agent references in workflows/commands
  - INDEX.md entries that don't match the actual filesystem
  - Hook scripts referencing invalid paths
  - Cross-file contradictions (rule A says X, skill B says not-X)
  - Templates using patterns that contradict current skills
- **EVOLVE**: Missing coverage, new patterns (2+), recurring errors
  - User request falls outside any existing agent/skill coverage
  - Same manual pattern applied 3+ times across sessions (candidate for new skill)
  - Error log shows recurring issue with no corresponding rule
- **ADAPT**: Deprecated tech, stack mismatches, preferences
  - Skill/template references a library or pattern the project no longer uses
  - Tech stack in CLAUDE.md doesn't match actual project dependencies
  - User preferences consistently diverge from a documented rule
- **REFACTOR**: Overlaps, bloat (>300 lines), unused components
  - Two skills/agents with substantially overlapping content (merge candidate)
  - A single file exceeding 300 lines (split candidate)
  - Component not referenced by any other component (archive candidate)
  - Same rule/guideline duplicated across multiple files (consolidate candidate)

### Resolution (After Primary Task Completes)

After finishing the user's requested task, if you noted any system observations:

1. **Report**: Summarize observations grouped by type (heal/evolve/adapt/refactor). Be concise.
2. **Act by Tier**:
   - **Auto-apply + notify** (Minor/structural): Regenerate INDEX.md, fix broken refs in frontmatter, fix obvious typos
   - **Propose + wait for approval** (Major/content): Update skill/agent/rule content, modify templates/checklists/workflows, archive unused components
   - **Propose + wait for approval** (Evolution): Create new skill/agent/command/workflow, add new rule/guideline/hook/script
   - **Never auto-modify**: `.claude/settings.json`, `.claude/settings.local.json`, `.claude/rules/essential-rules.md`, `setup.cjs`
3. **Log**: Append to `.claude/health/changelog.md` (see Changelog Rules below)

---

## 3. Pattern Detection & Auto-Healing

**Threshold**: 2+ occurrences (semantic similarity)
**Sources**: Error log, agent errors, changelog (heal 2+ times)

**Workflow**: Scan → Identify target → Generate fix → Apply → Log (Auto: yes) → Notify

---

## 3.5. Single-Error Root Cause Fixing

**Fix immediately if ALL true**:
1. Root cause clear (not speculative)
2. Localized (1-3 files)
3. Low-risk (strengthen rules, add checks, fix refs)
4. Prevents recurrence

**Auto-apply**: Strengthen enforcement, fix broken refs, add validation, update paths, add error handling
**Propose**: Create components, change core logic, modify API, archive/delete code

---

## 4. Proactive Enhancement

Enhancement = improve what works (vs heal = fix broken)

**Triggers** (threshold):
- Same code pattern (2+) → template
- Same error (2+) → update agent/rule
- Same knowledge (2+) → skill
- Same workflow (2+) → command
- Same validation (2+) → checklist
- Outside coverage (1) → propose skill/agent
- Manual work (2+) → automation

**Auto-apply**: Fix refs, regen INDEX, fix typos, sync refs
**Propose**: Create templates/skills/agents/commands, modify rules, update checklists/workflows, archive

---

## 5. Changelog Rules

**ONLY self-initiated** (Claude's ideas, NOT user requests)

Format:
```markdown
## [YYYY-MM-DD] type(scope): description
- **Type**: heal | enhance
- **Auto**: yes | no
- **Changed**: files
- **Reason**: why
```

---

## 6. Error Logging Flow

| Source | Who Logs | Where |
|--------|----------|-------|
| Main agent | Main | `.claude/user/errors.md` |
| Subagent | Main | `.claude/user/agent-errors/{agent}.md` |
| Subagent fix | Main | `.claude/user/changelog.md` |

**Main**: Read errors.md, LOG IMMEDIATELY on failure, log subagent errors/fixes
**Subagents**: Read agent-errors/{name}.md, fix broken refs, report errors/fixes

### Error Correction by Role

**Main Agent**: When the main agent makes an error, it must append an entry to the Error Log section of `CLAUDE.md` describing the mistake concisely. Format: `- [short description of what went wrong and the correct approach]`

**Subagents (Specialists)**: When a subagent encounters errors or inconsistencies in `.claude/` files during delegated work, it should fix them inline:
- **Broken references in its own agent definition**: Fix the frontmatter directly
- **Outdated advice in a skill it loads**: Update the skill content
- **Inconsistency between its instructions and project reality**: Correct the agent/skill to match reality
- **Inefficiency in its own workflow**: Streamline its definition

Subagent fixes follow the same approval tiers (auto-apply minor/structural, propose major content changes).

### Accountability Chain
1. Subagent discovers issue in `.claude/` config -> fixes it (or proposes fix) as part of task
2. Subagent reports corrections in its response to the main agent
3. Main agent logs corrections to `.claude/health/changelog.md`
4. Main agent makes its own error -> appends to `CLAUDE.md` Error Log immediately
5. Recurring errors (3+ occurrences in Error Log) -> trigger rule/skill update proposal

---

## 7. Guardrails

**Limits**: Primary task first, max 5 changes/session, max 5 files/change, escalate if recurs

**Immutable**: `.claude/settings.json`, `.claude/settings.local.json`, `.claude/rules/essential-rules.md`, `setup.cjs`

**Git**: Every change = own commit with prefix (`heal()`, `evolve()`, `adapt()`, or `refactor()`), user features = NO auto-commits

**No loops**: If the same issue recurs after a fix attempt, escalate to user -- do not retry

**Observation overflow**: If >10 observations accumulate, suggest running `/health-check` instead of inline resolution

---

## 8. Constitutional Invariants

1. **Hybrid agent**: Main codes + specialists handle complex
2. **Security-first**: Never weaken security/bypass hooks
3. **Human oversight**: Significant changes need approval
4. **Git reversibility**: Every change committed
5. **Token-consciousness**: Improvement < faults prevented
6. **Aggressive logging**: Log ALL failures
