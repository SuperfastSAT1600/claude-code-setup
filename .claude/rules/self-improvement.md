# Self-Improvement System

The system continuously improves itself through aggressive error logging, pattern detection, and proactive enhancement.

---

## 1. Error Logging (Aggressive)

**Threshold**: If something didn't work as expected, LOG IT. Over-logging is better than missing patterns.

### 6 Failure Categories

| Category | Examples | Log Format |
|----------|----------|------------|
| **1. Tool/API** | MCP errors, WebFetch fails, GitHub API errors, Bash failures | `[tool] Error: [what] \| Expected: [expected]` |
| **2. Code Generation** | Syntax errors, type errors, import errors, security vulnerabilities | `[code] Error: [what] \| Correct: [how]` |
| **3. Terminal/Command** | Wrong syntax, permission denied, Git failures, package manager errors | `[cmd] Error: [failed] \| Correct: [working]` |
| **4. Context/Understanding** | Misunderstood intent, wrong file modified, wrong assumptions, **didn't use available skill** | `[context] Error: [assumption] \| Reality: [actual]` |
| **5. Agent Coordination** | Wrong agent delegated, unhelpful results, missed parallelization | `[agent] Error: [what] \| Better: [approach]` |
| **6. System Config** | Non-existent file referenced, broken references, outdated patterns | `[config] Error: [broken] \| Fix: [how]` |

### Where to Log

- **Main agent errors** → `.claude/user/errors.md`
- **Subagent errors** → `.claude/user/agent-errors/{agent-name}.md`

### Decision Tree

```
Did something not work as expected?
├─ Tool returned error → LOG IT
├─ Code had errors → LOG IT
├─ Command failed → LOG IT
├─ Wrong assumption made → LOG IT
├─ Didn't check/use available skill → LOG IT
├─ Subagent didn't help → LOG IT
├─ Had to retry → LOG IT
├─ User corrected me → LOG IT
├─ Found outdated info in .claude/ → LOG IT
├─ User shared an error → INVESTIGATE & LOG IT
└─ Everything worked perfectly → Don't log
```

### User-Reported Errors

When a user shares an error (screenshot, log, stack trace), don't just fix it—**investigate the root cause** of what Claude or subagents did wrong, then log it. The error itself isn't what we log; we log the mistake that caused it.

---

## 2. Observation Framework

While working on the user's primary task, note issues in `.claude/` files. Do NOT stop the task — just note observations mentally.

### Four Dimensions

**HEAL** (fix what's broken):
- Broken skill/agent references in frontmatter
- INDEX.md entries that don't match filesystem
- Cross-file contradictions
- Invalid paths in hooks/scripts

**EVOLVE** (grow what's missing):
- Task falls outside existing coverage
- Same pattern applied 2+ times (candidate for skill/template)
- Recurring error with no corresponding rule

**ADAPT** (adjust to environment):
- Skill references deprecated tech
- Tech stack mismatch with actual project
- User preferences diverge from documented rules

**REFACTOR** (simplify):
- Overlapping skills/agents (merge candidate)
- File >300 lines (split candidate)
- Unused components (archive candidate)
- Duplicated rules (consolidate candidate)

---

## 3. Pattern Detection & Auto-Healing

### Detection Sources

1. **Error Log** (`.claude/user/errors.md`) - Group by semantic similarity
2. **Agent Errors** (`.claude/user/agent-errors/`) - Per-agent patterns
3. **Changelog** (`.claude/user/changelog.md`) - Same heal entries 2+ times

### Detection Threshold

**2+ occurrences = pattern detected** (use semantic similarity, not exact match)

### Auto-Healing Workflow

```
1. Scan error sources for patterns (2+ similar entries)
2. For each detected pattern:
   a. Identify target file (which agent/skill/rule should prevent this?)
   b. Generate concise fix (1-5 lines of guidance)
   c. Apply fix to target file
   d. Log to changelog with "Auto: yes"
   e. Notify user: "Auto-healed recurring pattern: [what]"
```

### Example

```
DETECTED: 3 entries about "GitHub API rate limit"
AUTO-HEAL: Update .claude/skills/github-actions.md:
  "Always check rate limit before bulk operations: gh api rate_limit"
LOG: heal(auto): add rate limit checking to github-actions skill
NOTIFY: "Auto-healed: Added rate limit guidance (3 occurrences detected)"
```

---

## 4. Proactive Enhancement

Enhancement = improving what works (vs healing = fixing what's broken)

### Enhancement Triggers

| Trigger | Threshold | Enhancement |
|---------|-----------|-------------|
| Same code pattern | 2+ times | Create template |
| Same error logged | 2+ times | Update agent/rule |
| Same knowledge needed | 2+ times | Create/update skill |
| Same multi-step workflow | 2+ times | Create command |
| Same validation steps | 2+ times | Create checklist |
| Task outside coverage | 1 time | Propose new skill/agent |
| Manual work repeated | 2+ times | Create automation/script |

### Auto-Apply vs Propose

**Auto-apply immediately** (no approval needed):
- Fix broken references (files, skills, agents)
- Regenerate INDEX.md to match filesystem
- Fix obvious typos
- Sync file references across documents

**Propose for approval** (major changes):
- Create new templates, skills, agents, commands
- Modify rule content
- Update checklists or workflows
- Archive unused components

---

## 5. Changelog Rules (CRITICAL)

### ONLY Log Self-Initiated Changes

The changelog tracks Claude's ideas, NOT user requests.

| Scenario | Log? |
|----------|------|
| Claude proposes enhancement → user accepts | ✅ YES |
| Claude detects broken reference → auto-fixes | ✅ YES |
| Claude finds pattern → creates skill | ✅ YES |
| User requests a change → Claude implements | ❌ NO |
| User explicitly asks to update a file | ❌ NO |
| User provides exact content to add | ❌ NO |

### Entry Format

```markdown
## [YYYY-MM-DD] type(scope): description
- **Type**: heal | enhance
- **Auto**: yes | no
- **Changed**: file(s) modified
- **Reason**: why this change was needed
```

### Entry Types

- `heal(scope)` - Fixing broken things
- `enhance(scope)` - Improving the system

---

## 6. Error Logging Flow

### Who Logs What

| Error Source | Who Logs | Where |
|--------------|----------|-------|
| Main agent error | Main agent | `.claude/user/errors.md` |
| Subagent error | **Main agent** | `.claude/user/agent-errors/{agent-name}.md` |
| Subagent fix | **Main agent** | `.claude/user/changelog.md` |

**Key**: Subagents can't write files directly. They **report** errors/fixes in their response, and the **main agent logs them**.

### Main Agent Responsibilities

1. Read `.claude/user/errors.md` before starting any task
2. Track ALL failures during task (6 categories)
3. Log own errors to `errors.md`
4. When subagent reports errors → log to `agent-errors/{agent-name}.md`
5. When subagent reports fixes → log to `changelog.md`

### Subagent Responsibilities

1. Read `.claude/user/agent-errors/{your-name}.md` before starting
2. Fix broken references in own agent file if found
3. **Report** all errors and fixes in structured response:
   ```
   ## Errors Encountered
   - [category] Error: [what] | Correct: [how]

   ## System Fixes Applied
   - Fixed: [file] - [what was wrong]
   ```

---

## 7. Guardrails

### Limits
- **Primary task first**: Never delay user's work for self-improvement
- **Session cap**: Maximum 5 system changes per session
- **Scope cap**: Maximum 5 files per single change action
- **No loops**: If same issue recurs after fix, escalate to user

### Immutable Files (Never Auto-Modify)
- `.claude/settings.json`
- `.claude/settings.local.json`
- `.claude/rules/coding-standards.md`
- `CLAUDE.md`
- `setup.cjs`

### Git Discipline
- Every system change gets its own commit
- Prefix: `heal(scope):` or `enhance(scope):`
- Commit separately from task work

---

## 8. Constitutional Invariants

These principles are never violated:

1. **Hybrid agent principle**: Main agent codes + specialists handle complex domains
2. **Security-first**: Never weaken security rules or bypass safety hooks
3. **Human oversight**: Significant changes always require user approval
4. **Git reversibility**: Every change is committed and revertable
5. **Token-consciousness**: Self-improvement must cost less than faults it prevents
6. **Aggressive error logging**: Log ALL failures, not just obvious mistakes
