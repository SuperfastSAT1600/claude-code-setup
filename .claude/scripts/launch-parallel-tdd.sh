#!/bin/bash
# =============================================================================
# Launch Parallel TDD (hook wrapper)
# Called by: PostToolUse hook on Write to .claude/plans/*.md
# Uses the just-written spec file (passed via $file_path env var from hook,
# or falls back to finding the most recent spec in .claude/plans/).
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Prefer the file that was just written (set by the Write hook via $file_path)
if [[ -n "${file_path:-}" && -f "${file_path}" ]]; then
    latest="$file_path"
else
    # Fallback: most recent spec in .claude/plans/
    PLANS_DIR="$PROJECT_ROOT/.claude/plans"
    latest=""
    if [[ -d "$PLANS_DIR" ]]; then
        latest=$(find "$PLANS_DIR" -name "*.md" -type f -print0 2>/dev/null \
            | xargs -0 ls -t 2>/dev/null \
            | head -n 1)
    fi
fi

if [[ -z "$latest" ]]; then
    echo "[Hook] No spec found — skipping parallel TDD setup" >&2
    exit 0
fi

# Count REQs — skip if fewer than 2 (not worth parallelising)
req_count=$(grep -cE 'REQ-[0-9]{3}' "$latest" 2>/dev/null || echo 0)
if [[ "$req_count" -lt 2 ]]; then
    echo "[Hook] Only $req_count REQ(s) in spec — skipping parallel TDD (use /tdd instead)" >&2
    exit 0
fi

# Guard: skip if worktrees already exist for this feature (avoids re-launch on spec edit)
WORKTREES_DIR="$PROJECT_ROOT/.worktrees"
spec_basename=$(basename "$latest" .md)
if [[ -d "$WORKTREES_DIR" ]]; then
    active_worktrees=$(find "$WORKTREES_DIR" -maxdepth 1 -type d -name "${spec_basename}*" 2>/dev/null | head -1)
    if [[ -n "$active_worktrees" ]]; then
        echo "[Hook] Worktrees already exist for '${spec_basename}' — skipping re-launch. Delete .worktrees/${spec_basename}* to re-run." >&2
        exit 0
    fi
fi

echo "[Hook] Launching parallel TDD for: ${latest##*/} ($req_count REQs)" >&2

bash "$SCRIPT_DIR/create-tdd-team.sh" "$latest" 2>&1
