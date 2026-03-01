#!/bin/bash
# =============================================================================
# Launch Parallel TDD (hook wrapper)
# Called by: PostToolUse hook on ExitPlanMode
# Finds the most recent spec in .claude/plans/ and either:
#   - Launches parallel-tdd.sh (local mode: tmux/vscode + worktrees)
#   - Outputs cloud-mode instructions for subagent worktree orchestration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PLANS_DIR="$PROJECT_ROOT/.claude/plans"

# Find most recent plan
latest=""
if [[ -d "$PLANS_DIR" ]]; then
    latest=$(find "$PLANS_DIR" -name "*.md" -type f -print0 2>/dev/null \
        | xargs -0 ls -t 2>/dev/null \
        | head -n 1)
fi

if [[ -z "$latest" ]]; then
    echo "[Hook] No spec found in .claude/plans/ — skipping parallel TDD setup" >&2
    exit 0
fi

# Count REQs — skip if fewer than 2 (not worth parallelising)
req_count=$(grep -cE 'REQ-[0-9]{3}' "$latest" 2>/dev/null || echo 0)
if [[ "$req_count" -lt 2 ]]; then
    echo "[Hook] Only $req_count REQ(s) in spec — skipping parallel TDD (use /tdd instead)" >&2
    exit 0
fi

# Extract unique REQ IDs for cloud-mode output
req_ids=$(grep -oE 'REQ-[0-9]{3}' "$latest" 2>/dev/null | sort -u)
spec_relpath="${latest#$PROJECT_ROOT/}"

# --- Environment detection ---
# Cloud sessions lack tmux and the claude CLI (separate process).
# Detect by checking for both tools.
has_claude_cli=false
has_tmux=false
command -v claude &>/dev/null && has_claude_cli=true
command -v tmux &>/dev/null && has_tmux=true

if [[ "$has_claude_cli" == "true" ]] && ( [[ "$has_tmux" == "true" ]] || pgrep -x "Code" &>/dev/null 2>&1 ); then
    # Local mode: launch parallel-tdd.sh with worktrees + tmux/vscode
    echo "[Hook] Launching parallel TDD for: ${latest##*/} ($req_count REQs)" >&2
    bash "$SCRIPT_DIR/parallel-tdd.sh" "$latest" --no-attach 2>&1
else
    # Cloud mode: output instructions for subagent worktree orchestration
    echo "[Hook] CLOUD MODE: tmux/claude CLI unavailable — use subagent worktrees instead" >&2
    echo "" >&2
    echo "[Hook] === PARALLEL TDD (CLOUD MODE) ===" >&2
    echo "[Hook] Spec: $spec_relpath ($req_count REQs)" >&2
    echo "[Hook] REQs found: $req_ids" | tr '\n' ', ' >&2
    echo "" >&2
    echo "" >&2
    echo "[Hook] ACTION REQUIRED: Launch parallel subagents with isolated worktrees." >&2
    echo "[Hook] For each group of REQs, use the Agent tool with:" >&2
    echo "[Hook]   subagent_type: \"general-purpose\"" >&2
    echo "[Hook]   isolation: \"worktree\"" >&2
    echo "[Hook] Each subagent gets its own branch and filesystem." >&2
    echo "[Hook] See /parallel-tdd command for the full cloud-mode workflow." >&2
    echo "" >&2
    echo "[Hook] While subagents implement REQs, work on shared infrastructure" >&2
    echo "[Hook] (types, interfaces, routing, integration) in the main branch." >&2
fi
