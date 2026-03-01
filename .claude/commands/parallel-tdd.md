---
description: Split a spec into parallel workstreams for spec-driven TDD. Auto-detects environment — uses tmux+worktrees locally, subagent worktrees in cloud sessions.
allowed-tools: Bash(./.claude/scripts/parallel-tdd.sh *), Bash(git worktree *), Bash(tmux *), Bash(./.claude/scripts/audit-spec.sh *), Bash(./.claude/scripts/verify-traceability.sh *), Bash(./.claude/scripts/merge-parallel.sh *), Agent
---

# Parallel TDD Command

Run spec-driven TDD across multiple isolated git worktrees. Auto-detects your environment:
- **Local CLI**: Launches tmux/VSCode tabs with separate `claude` processes
- **Cloud sessions**: Uses Agent tool with `isolation: "worktree"` for subagent-per-branch parallelism

---

## Usage

```
/parallel-tdd [spec-file] [num-agents]
```

**Examples:**
```
/parallel-tdd .claude/plans/auth.md
/parallel-tdd .claude/plans/checkout.md 4
/parallel-tdd                              # uses most recent plan in .claude/plans/
```

---

## Prerequisites

- A valid spec file in `.claude/plans/` (create one with `/plan`)
- Spec must pass audit: `bash .claude/scripts/audit-spec.sh <spec>`

**Local mode additionally requires:**
- `tmux` installed (`brew install tmux`) or VS Code running
- `claude` CLI available in PATH

**Cloud mode has no additional requirements** — uses built-in Agent tool.

---

## Mode Detection

The command auto-detects which mode to use:

| Condition | Mode | How it works |
|-----------|------|-------------|
| `claude` CLI + `tmux` available | **Local** | Separate processes in tmux windows with git worktrees |
| `claude` CLI + VS Code running | **Local** | Separate processes in VS Code terminal tabs with git worktrees |
| Neither available (cloud session) | **Cloud** | Subagent worktrees via Agent tool with `isolation: "worktree"` |

---

## Local Mode

### Architecture
```
spec.md  (REQ-001 to REQ-009, 3 agents)
    │
    ├── .worktrees/auth-agent-1   → tmux: agent-1 → Claude (REQ-001, 002, 003)
    ├── .worktrees/auth-agent-2   → tmux: agent-2 → Claude (REQ-004, 005, 006)
    └── .worktrees/auth-agent-3   → tmux: agent-3 → Claude (REQ-007, 008, 009)
```

### Why Worktrees + tmux?

| Problem | Solution |
|---------|----------|
| Context overflow with parallel Task agents | Each tmux window = separate `claude` process = separate context |
| File write conflicts between parallel agents | Each worktree = isolated filesystem on its own branch |
| Hard to monitor multiple agents | tmux windows — switch between agents anytime |

### Runs
`.claude/scripts/parallel-tdd.sh <spec> <num-agents>`

---

## Cloud Mode (Subagent Worktrees)

When tmux/claude CLI are unavailable (cloud sessions, web IDE, etc.), use the Agent tool with isolated worktrees.

### Architecture
```
spec.md  (REQ-001 to REQ-009, 3 subagents)
    │
    ├── Agent(isolation: "worktree") → Subagent 1 (REQ-001, 002, 003) → branch returned
    ├── Agent(isolation: "worktree") → Subagent 2 (REQ-004, 005, 006) → branch returned
    └── Agent(isolation: "worktree") → Subagent 3 (REQ-007, 008, 009) → branch returned
    │
    Main agent: works on shared types, interfaces, routing while subagents run
```

### Cloud Mode Workflow

**Step 1: Parse and distribute REQs**
```bash
# Extract REQ IDs from spec
grep -oE 'REQ-[0-9]{3}' .claude/plans/<spec>.md | sort -u
```

**Step 2: Launch subagents in parallel (single message, multiple Agent calls)**

For each group of REQs, launch an Agent with `isolation: "worktree"`:

```
Agent(
  subagent_type: "general-purpose",
  isolation: "worktree",
  prompt: "You are implementing specific requirements using strict TDD in an isolated git worktree.

## Spec
Read the full spec at .claude/plans/<spec>.md for context.

## Your Requirements
Implement ONLY: REQ-001, REQ-002, REQ-003

## Instructions
1. Read the spec for full context
2. For each assigned requirement:
   - Write a failing test: test('REQ-XXX: observable behavior', () => { ... })
   - Write minimal code to pass the test
   - Refactor while keeping tests green
3. Do NOT implement requirements outside your assignment
4. Commit your work: git add <files> && git commit -m 'feat: implement REQ-001, REQ-002, REQ-003'
5. Report which REQs are green and which had issues"
)
```

**Step 3: Main agent works in parallel**

While subagents implement REQs, the main agent works on:
- Shared types and interfaces that REQ implementations will need
- Routing and navigation setup
- Integration scaffolding
- Shared utilities

**Step 4: Merge results**

Each subagent returns its worktree branch name. Merge them:
```bash
bash .claude/scripts/merge-parallel.sh
# Or manually:
git merge --no-ff <branch-from-subagent-1>
git merge --no-ff <branch-from-subagent-2>
git merge --no-ff <branch-from-subagent-3>
```

**Step 5: Verify traceability**
```bash
bash .claude/scripts/verify-traceability.sh .claude/plans/<spec>.md
```

---

## TDD Flow Per Agent (Both Modes)

Each agent follows the same TDD process regardless of mode:

1. Read the full spec for context
2. For each assigned REQ:
   - Write failing test: `test('REQ-XXX: observable behavior', () => { ... })`
   - Implement minimal code to pass
   - Refactor
3. Commit when all assigned REQs are green

---

## After Agents Finish

### Merge branches
```bash
# Automated merge with conflict detection:
bash .claude/scripts/merge-parallel.sh

# Or manually:
git checkout main
git merge --no-ff feat/auth-agent-1
git merge --no-ff feat/auth-agent-2
git merge --no-ff feat/auth-agent-3
```

### Verify traceability
```bash
bash .claude/scripts/verify-traceability.sh .claude/plans/<spec>.md
```

### Clean up (local mode only)
```bash
git worktree prune
git branch -d feat/auth-agent-1 feat/auth-agent-2 feat/auth-agent-3
```

---

## Tips

**Start with `/plan`** to create a well-structured spec with clear REQ IDs before running this.

**Check audit first**:
```bash
bash .claude/scripts/audit-spec.sh .claude/plans/your-spec.md
```

**Local mode monitoring**: Switch between tmux windows with `Ctrl+b <window-number>` or `Ctrl+b n/p`

**Cloud mode**: Launch all subagents in a single message for true parallelism. Don't wait for one to finish before launching the next.

**REQ distribution**: Keep related REQs together. If REQ-003 depends on REQ-001's types, assign them to the same agent.

---

## Related Commands

- `/plan` — create the spec this command consumes
- `/tdd` — single-agent TDD (no parallelism)
- `/review` — review implementation after merging
- `/test-ladder` — progressive test escalation after implementation
- `/checkpoint` — full quality gate verification
