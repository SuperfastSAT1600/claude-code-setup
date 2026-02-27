---
description: Split a spec into parallel workstreams, create isolated git worktrees, and launch Claude in tmux windows for parallel spec-driven TDD
allowed-tools: Bash(./.claude/scripts/parallel-tdd.sh *), Bash(git worktree *), Bash(tmux *)
---

# Parallel TDD Command

Run spec-driven TDD across multiple isolated git worktrees, each in its own tmux window with its own Claude session — no context overflow, no file conflicts.

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
- `tmux` installed (`brew install tmux`)
- `claude` CLI available in PATH

---

## What This Command Does

1. **Parses the spec** — extracts all `REQ-XXX` IDs
2. **Distributes REQs** — splits them evenly across N agents (round-robin)
3. **Creates git worktrees** — one isolated branch + directory per agent
4. **Launches tmux session** — one window per agent + one integration window
5. **Starts Claude** in each window with a focused task file (`.claude-task.md`)

Each agent works in complete isolation:
- Its own filesystem (worktree)
- Its own context window (separate `claude` process)
- Its own branch

---

## Architecture

```
spec.md  (REQ-001 to REQ-009, 3 agents)
    │
    ├── .worktrees/auth-agent-1   → tmux: agent-1 → Claude (REQ-001, 002, 003)
    ├── .worktrees/auth-agent-2   → tmux: agent-2 → Claude (REQ-004, 005, 006)
    └── .worktrees/auth-agent-3   → tmux: agent-3 → Claude (REQ-007, 008, 009)

tmux session: tdd-auth
    ├── window: integration   (merge controller, stays on main branch)
    ├── window: agent-1       (Claude implementing REQ-001, 002, 003)
    ├── window: agent-2       (Claude implementing REQ-004, 005, 006)
    └── window: agent-3       (Claude implementing REQ-007, 008, 009)
```

---

## Why Worktrees + tmux?

| Problem | Solution |
|---------|----------|
| Context overflow with parallel Task agents | Each tmux window = separate `claude` process = separate context |
| File write conflicts between parallel agents | Each worktree = isolated filesystem on its own branch |
| Hard to monitor multiple agents | tmux windows — switch between agents anytime |

---

## TDD Flow Per Agent

Each agent receives a `.claude-task.md` with its specific REQ assignment and follows:

1. Read the full spec for context
2. For each assigned REQ:
   - Write failing test: `test('REQ-XXX: observable behavior', () => { ... })`
   - Implement minimal code to pass
   - Refactor
3. Commit when all assigned REQs are green

---

## After Agents Finish

Merge worktree branches back to main, one at a time:

```bash
git checkout main
git merge --no-ff feat/auth-agent-1
git merge --no-ff feat/auth-agent-2
git merge --no-ff feat/auth-agent-3
```

Clean up:
```bash
git worktree prune
git branch -d feat/auth-agent-1 feat/auth-agent-2 feat/auth-agent-3
```

---

## Command Behavior

**Runs**: `.claude/scripts/parallel-tdd.sh <spec> <num-agents>`

**Creates**:
- `.worktrees/<feature>-agent-N/` — git worktree per agent
- `.worktrees/<feature>-agent-N/.claude-task.md` — focused task per agent
- tmux session `tdd-<feature>`

**Does not**:
- Modify the main branch during execution
- Run tests itself (agents do that)
- Auto-merge (you control when/how to merge)

---

## Tips

**Start with `/plan`** to create a well-structured spec with clear REQ IDs before running this.

**Check audit first**:
```bash
./.claude/scripts/audit-spec.sh .claude/plans/your-spec.md
```

**Monitor agents**: Switch between tmux windows with `Ctrl+b <window-number>` or `Ctrl+b n/p`

**Interrupt an agent**: Switch to its window and `Ctrl+c` to stop Claude

**Resume a session**: `tmux attach -t tdd-<feature>`

---

## Related Commands

- `/plan` — create the spec this command consumes
- `/tdd` — single-agent TDD (no parallelism)
- `/review` — review implementation after merging
