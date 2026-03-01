#!/bin/bash
# =============================================================================
# Enforce Plan Spec
# Description: Block ExitPlanMode unless a valid spec exists in .claude/plans/
# Called by: PreToolUse hook on ExitPlanMode
# Exit codes:
#   0 = spec passes audit (allow exit)
#   2 = no spec found OR spec fails audit (BLOCK exit)
# =============================================================================

PLANS_DIR=".claude/plans"
AUDIT_SCRIPT="./.claude/scripts/audit-spec.sh"

# Find active spec: prefer .active-spec marker, fallback to most recent by mtime
latest=""
ACTIVE_SPEC_MARKER=".claude/user/.active-spec"

if [[ -f "$ACTIVE_SPEC_MARKER" ]]; then
    # Read the marker file for the active spec path
    marker_path=$(cat "$ACTIVE_SPEC_MARKER" 2>/dev/null | head -1 | tr -d '[:space:]')
    if [[ -n "$marker_path" ]] && [[ -f "$marker_path" ]]; then
        latest="$marker_path"
    fi
fi

# Fallback: most recent plan file by modification time
if [[ -z "$latest" ]] && [[ -d "$PLANS_DIR" ]]; then
    latest=$(find "$PLANS_DIR" -name "*.md" -type f -print0 2>/dev/null \
        | xargs -0 ls -t 2>/dev/null \
        | head -n 1)
fi

# No spec found — BLOCK
if [[ -z "$latest" ]]; then
    echo "[Hook] BLOCKED — no spec found in .claude/plans/" >&2
    echo "" >&2
    echo "[Hook] CLAUDE ACTION REQUIRED: Do NOT wait or ask the user." >&2
    echo "[Hook] CLAUDE: Write the plan to a file now:" >&2
    echo "[Hook]   1. Create .claude/plans/[feature-name].md using .claude/templates/spec.md.template" >&2
    echo "[Hook]   2. Add REQ-XXX IDs, (TEST)/(BROWSER)/(MANUAL) tags, and a traceability matrix" >&2
    echo "[Hook]   3. Then call ExitPlanMode again automatically." >&2
    exit 2
fi

# Spec found — run audit
echo "[Hook] Auditing spec: ${latest#./}" >&2
echo "" >&2

if bash "$AUDIT_SCRIPT" "$latest" >&2; then
    echo "" >&2
    echo "[Hook] Spec passed. Exiting plan mode." >&2
    exit 0
else
    audit_exit=$?
    echo "" >&2
    if [[ $audit_exit -eq 2 ]]; then
        echo "[Hook] BLOCKED — spec has issues. ExitPlanMode will not proceed." >&2
        echo "" >&2
        echo "[Hook] CLAUDE ACTION REQUIRED: Do NOT wait or ask the user." >&2
        echo "[Hook] CLAUDE: Fix the spec at ${latest} by:" >&2
        echo "[Hook]   1. Adding REQ-XXX IDs to any requirements missing them" >&2
        echo "[Hook]   2. Adding (TEST)/(BROWSER)/(MANUAL) tags to every requirement" >&2
        echo "[Hook]   3. Ensuring a traceability matrix exists" >&2
        echo "[Hook] CLAUDE: Then call ExitPlanMode again automatically." >&2
        exit 2
    else
        # exit 1 from audit = warnings only, allow through
        echo "[Hook] Spec has minor warnings. Proceeding." >&2
        exit 0
    fi
fi
