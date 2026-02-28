# Self-Improvement System

Continuously improve through error logging, pattern detection, observation, and proactive enhancement.

---

## 1. Error Logging (Aggressive)

**Threshold**: If didn't work as expected, LOG IT. Over-logging > missing patterns.

### 6 Failure Categories

| Category | Format |
|----------|--------|
| Tool/API | `[tool] Error: [what] \| Expected: [expected]` |
| Code | `[code] Error: [what] \| Correct: [how]` |
| Command | `[cmd] Error: [failed] \| Correct: [working]` |
| Context | `[context] Error: [assumption] \| Reality: [actual]` |
| Agent | `[agent] Error: [what] \| Better: [approach]` |
| Config | `[config] Error: [broken] \| Fix: [how]` |

**Where**: Main → `.claude/user/errors.md`, Subagents → `.claude/user/agent-errors/{agent-name}.md`
**When**: Tool/code/command error, wrong assumption, didn't check skill, subagent didn't help, retry, user corrected, outdated info → **LOG IT**

---

## 2. Observation Framework

Note improvements while working. Report at end. Don't delay user's work.

- **HEAL**: Broken refs, contradictions, invalid paths, INDEX mismatches, hook script errors
- **EVOLVE**: Missing coverage, new patterns (2+), recurring errors, requests outside agent/skill coverage
- **ADAPT**: Deprecated tech, stack mismatches, preferences, divergent user conventions
- **REFACTOR**: Overlaps, bloat (>300 lines), unused components, duplicate rules

---

## 3. Pattern Detection & Auto-Healing

**Threshold**: 2+ occurrences (semantic similarity)
**Sources**: Error log, agent errors, changelog

**Single-error root cause fixing** — fix immediately if ALL true:
1. Root cause clear (not speculative)
2. Localized (1-3 files)
3. Low-risk (strengthen rules, add checks, fix refs)
4. Prevents recurrence

---

## 4. Resolution Tiers

**Auto-apply + notify**: Regenerate INDEX.md, fix broken refs, fix typos, sync refs
**Propose + wait**: Update skill/agent/rule content, modify templates/checklists/workflows, archive unused, create new components

**Never auto-modify**: `.claude/settings.json`, `.claude/settings.local.json`, `.claude/rules/essential-rules.md`, `setup.cjs`

---

## 5. Error Correction by Role

**Main agent**: Log errors to `.claude/user/errors.md`. Recurring errors (3+) trigger rule/skill update proposal.
**Subagents**: Fix `.claude/` issues inline (broken refs, outdated skills, inconsistencies). Report corrections for main agent to log to `.claude/health/changelog.md`.

---

## 6. Proactive Enhancement Triggers

- Same code pattern (2+) → template
- Same error (2+) → update agent/rule
- Same knowledge (2+) → skill
- Same workflow (2+) → command
- Outside coverage (1) → propose skill/agent

---

## 7. Changelog

**ONLY self-initiated** (Claude's ideas, NOT user requests). Format:
```markdown
## [YYYY-MM-DD] type(scope): description
- **Type**: heal | enhance
- **Auto**: yes | no
- **Changed**: files
- **Reason**: why
```

---

## 8. Guardrails

- **Primary task first**: Never delay user's work for self-improvement
- **Session cap**: Max 5 system changes/session, max 5 files/change
- **Git discipline**: Every change = own commit (heal/enhance prefix)
- **No loops**: If same issue recurs after fix, escalate to user
- **Overflow**: >10 observations → suggest `/health-check`

---

## 9. Constitutional Invariants

1. **Hybrid agent**: Main codes + specialists handle complex
2. **Security-first**: Never weaken security/bypass hooks
3. **Human oversight**: Significant changes need approval
4. **Git reversibility**: Every change committed
5. **Token-consciousness**: Improvement < faults prevented
6. **Aggressive logging**: Log ALL failures
