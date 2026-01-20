# Context Window Management (CRITICAL)

**CRITICAL**: Never exceed 80k context usage. Monitor and optimize actively to prevent performance degradation.

---

## The 200k → 70k Problem

Real-world battle-tested experience shows a critical performance degradation pattern:

**Starting Context**: 200k total context window
**With 10 MCPs + 20 tools enabled**: Drops to 70k usable context
**Result**: Slow responses (>10s), incomplete answers, session crashes

This is not theoretical - this is proven through 10+ months of intensive production usage.

---

## 1. Hard Limits (Battle-Tested Thresholds)

**Rule**: Follow these limits strictly to maintain performance.

### MCP Configuration Limits:
- **Pre-configured MCPs**: 15-25 MCPs (disabled in `.mcp.json`)
- **Enabled MCPs per project**: MAX 10 MCPs
- **Active tools**: <80 tools total across all MCPs

### File Size Limits:
- **Rules**: Max 500 lines per file
- **Skills**: Max 800 lines per file
- **Agents**: Max 400 lines per file
- **Commands**: Max 400 lines per file
- **CLAUDE.md**: Max 1000 lines

### Reading Strategy:
- **Single read operation**: Max 10 files
- **Entire session**: Max 50 files
- **If reading >10 files**: Delegate to specialized agent instead

---

## 2. MCP Server Management

**Rule**: Keep MCPs disabled until actually needed.

### Default State:
```json
// ✅ CORRECT: Pre-configured but disabled
{
  "mcpServers": {
    "filesystem": { "disabled": false },  // Essential, always enabled
    "github": { "disabled": true },       // Enable when working with GitHub
    "postgres": { "disabled": true },     // Enable for DB work
    "vercel": { "disabled": true },       // Enable for deployments
    // ... 14 more disabled servers
  }
}
```

### Per-Project Disabling:
```json
// .claude/settings.local.json
{
  "disabledMcpServers": [
    "github",      // Not using GitHub in this project
    "slack",       // Not integrating Slack
    "vercel"       // Using Railway instead
  ]
}
```

### MCP Count Monitoring:
```bash
# Check enabled MCPs before session
grep -c '"disabled": false' .mcp.json

# Should output: <10
```

---

## 3. Context Usage Monitoring

**Rule**: Watch for performance degradation signs.

### Performance Warning Signs:

**Response Time:**
- ✅ Normal: 2-5 seconds
- ⚠️ Slow: 5-10 seconds (approaching limit)
- 🚨 Critical: >10 seconds (over limit, reduce context)

**Response Quality:**
- ✅ Normal: Complete, detailed responses
- ⚠️ Degraded: Shorter responses, less detail
- 🚨 Critical: Incomplete responses, "I need to be brief", errors

**Session Stability:**
- ✅ Normal: Smooth operation
- ⚠️ Degraded: Occasional slowdowns
- 🚨 Critical: Timeouts, crashes, "context limit" errors

### When You Hit Limits:
1. **Disable unused MCPs**: Set `"disabled": true` for MCPs not actively needed
2. **Reduce file reads**: Use Grep to target specific code instead of reading entire directories
3. **Delegate to agents**: Move heavy analysis to specialized agents with isolated context
4. **Simplify rules/skills**: Remove outdated content, keep only essential patterns
5. **Clear conversation**: Start fresh session if accumulated too much context

---

## 4. Agent Delegation Strategy

**Rule**: Delegate context-heavy tasks to specialized agents.

### When to Delegate:

**Reading Many Files:**
```
❌ Bad: Read 50 files in main context
✅ Good: Delegate to specialized agent (e.g., planner, refactor-cleaner)
```

**Complex Analysis:**
```
❌ Bad: Analyze entire codebase for security issues
✅ Good: Delegate to security-reviewer agent
```

**Multi-Step Workflows:**
```
❌ Bad: Plan + implement + test in one context
✅ Good: Use planner agent → implement in main → use verify-app agent
```

### Delegation Threshold:
- **<5 files**: Work in main context
- **5-10 files**: Consider delegation
- **>10 files**: MUST delegate to agent

---

## 5. File Organization Standards

**Rule**: Keep configuration files concise and focused.

### Current File Sizes (Target):
```
.claude/rules/
├── security.md          (300-400 lines) ✅
├── coding-style.md      (300-400 lines) ✅
├── testing.md           (300-400 lines) ✅
├── git-workflow.md      (300-400 lines) ✅
├── performance.md       (300-400 lines) ✅
├── agents.md            (300-400 lines) ✅
├── hooks.md             (300-400 lines) ✅
└── context-management.md (300-400 lines) ✅

.claude/skills/
├── coding-standards.md  (500-600 lines) ✅
├── backend-patterns.md  (500-600 lines) ✅
├── frontend-patterns.md (500-600 lines) ✅
├── tdd-workflow.md      (500-600 lines) ✅
└── project-guidelines.md (600-800 lines) ✅

CLAUDE.md                (800-1000 lines) ✅
```

### When Files Grow Too Large:
1. **Split into focused files**: Break one 800-line rule into two 400-line rules
2. **Remove outdated content**: Delete deprecated patterns
3. **Move to CLAUDE.md**: Project-specific content goes to CLAUDE.md
4. **Compress examples**: Keep patterns, reduce redundant examples

---

## 6. Parallel Session Strategy

**Rule**: Use multiple parallel sessions for independent work.

### Effective Parallelization:
```
Session 1 (Main): Feature implementation
Session 2 (Security): Security audit (isolated context)
Session 3 (Testing): E2E test generation
Session 4 (Docs): Documentation updates
Session 5 (Analysis): Code review
```

### Benefits:
- Each session has independent 200k context
- No context contamination
- Faster overall completion
- Specialized focus per session

### Limits:
- **Recommended**: 3-5 parallel sessions
- **Maximum**: 5 sessions (diminishing returns)
- **Don't**: Run 10+ sessions (resource waste)

---

## 7. Context Budget Allocation

**Rule**: Allocate context budget strategically.

### Context Budget (Target 60-80k):
```
Conversation History:      20k tokens (30%)
Files Read:               15k tokens (20%)
Rules (7 files):          10k tokens (15%)
Skills (5 files):         10k tokens (15%)
Agents (when used):        8k tokens (10%)
MCP Tools (10 enabled):    7k tokens (10%)
────────────────────────────────────────
Total:                    70k tokens (safe zone)
```

### What Uses Most Context:
1. **MCP Tools** (7-10k per 10 MCPs)
2. **Conversation History** (grows over session)
3. **Files Read** (grows with each Read tool use)
4. **Rules & Skills** (constant overhead)
5. **Agent Definitions** (when delegating)

### Optimization Priority:
1. Disable unused MCPs (saves 7-10k per 10 MCPs)
2. Delegate heavy tasks (isolates context)
3. Start fresh sessions periodically
4. Keep rules/skills concise

---

## 8. CLAUDE.md Size Management

**Rule**: Keep CLAUDE.md under 1000 lines.

### Current Structure (Optimal):
```markdown
## Purpose                          (50 lines)
## Project-Specific Rules           (200 lines)
## Tech Stack                       (150 lines)
## Key Files & Directories          (200 lines)
## External Services                (100 lines)
## Team Conventions                 (200 lines)
## Resources                        (50 lines)
────────────────────────────────────────────
Total:                              ~950 lines ✅
```

### When CLAUDE.md Grows Too Large:
1. **Move to skills**: Generic patterns → `.claude/skills/`
2. **Move to rules**: Enforcement guidelines → `.claude/rules/`
3. **Compress**: Remove redundant examples
4. **Split**: Create `CLAUDE-BACKEND.md`, `CLAUDE-FRONTEND.md` if needed

---

## 9. Real-World Context Scenarios

### Scenario 1: "I'm getting slow responses"

**Diagnosis:**
```bash
# Check enabled MCPs
grep '"disabled": false' .mcp.json | wc -l
# Output: 15 (TOO MANY!)
```

**Solution:**
```json
// Disable unused MCPs
{
  "postgres": { "disabled": true },    // Not doing DB work now
  "slack": { "disabled": true },       // Not integrating Slack
  "google-maps": { "disabled": true }  // Not using maps
}
```

**Result:** 15 MCPs → 10 MCPs → Response time improved

---

### Scenario 2: "Session crashed during large refactor"

**Diagnosis:**
- Read 40 files in main context
- 3 agents running in parallel
- 12 MCPs enabled

**Solution:**
```
1. Disable 5 unused MCPs (12 → 7)
2. Delegate refactor to refactor-cleaner agent
3. Use Grep instead of reading all files
```

**Result:** Session stable, refactor completed successfully

---

### Scenario 3: "Running out of context during complex feature"

**Diagnosis:**
- Conversation history: 80k tokens (too much)
- Files read: 30 files
- All 18 MCPs enabled

**Solution:**
```
1. Start fresh session
2. Disable 10 MCPs (18 → 8 essential)
3. Use planner agent for planning phase
4. Implement in fresh main context
5. Use verify-app agent for testing
```

**Result:** Three focused sessions instead of one bloated session

---

## 10. Hook for MCP Monitoring

**Rule**: Add automated warning when too many MCPs are enabled.

### PreToolUse Hook:
```json
{
  "when": "PreToolUse",
  "matcher": "tool == \"Read\" && tool_input.file_path matches \"\\\\.mcp\\\\.json\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nENABLED=$(grep -c '\"disabled\": false' \"$file_path\" 2>/dev/null || echo 0)\nif [ $ENABLED -gt 10 ]; then\n  echo \"[Hook] WARNING: $ENABLED MCPs enabled (max 10 recommended). Performance may degrade.\" >&2\nfi"
  }]
}
```

This hook automatically warns when opening `.mcp.json` if >10 MCPs are enabled.

---

## Context Management Checklist

Before starting work:
- [ ] Count enabled MCPs: `grep -c '"disabled": false' .mcp.json` (should be <10)
- [ ] Check CLAUDE.md size: `wc -l CLAUDE.md` (should be <1000)
- [ ] Review rule files: all <500 lines
- [ ] Review skill files: all <800 lines

During work:
- [ ] Watch response times (should be <5 seconds)
- [ ] Delegate if reading >10 files
- [ ] Disable unused MCPs as you go
- [ ] Start fresh session if approaching limits

After major work:
- [ ] Clean up unused context
- [ ] Compress verbose files
- [ ] Update relevant rules/skills
- [ ] Remove outdated content

---

## Summary: The Critical Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Total Context** | 60-80k | 80-120k | >120k |
| **Enabled MCPs** | 5-8 | 8-10 | >10 |
| **Active Tools** | <50 | 50-80 | >80 |
| **Files Read** | <30 | 30-50 | >50 |
| **Response Time** | 2-5s | 5-10s | >10s |
| **CLAUDE.md** | <800 | 800-1000 | >1000 |
| **Rules (each)** | <400 | 400-500 | >500 |
| **Skills (each)** | <600 | 600-800 | >800 |

---

## Resources

- Claude Code Performance: https://docs.anthropic.com/claude-code
- Everything-Claude-Code (battle-tested configs): https://github.com/PriNova/everything-claude-code
- Context Window Best Practices: [Internal documentation]

---

**Remember**: The 200k → 70k degradation is REAL. These limits are learned from production use, not theory. Respect them to maintain peak performance.
