#!/bin/bash
# =============================================================================
# Launch Parallel TDD (hook wrapper)
# Called by: PostToolUse hook on ExitPlanMode
# Finds the most recent spec in .claude/plans/ and launches parallel-tdd.sh
# with --no-attach so the hook doesn't block the current session.
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLANS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)/.claude/plans"

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

echo "[Hook] Launching parallel TDD for: ${latest##*/} ($req_count REQs)" >&2
bash "$SCRIPT_DIR/parallel-tdd.sh" "$latest" --no-attach 2>&1
