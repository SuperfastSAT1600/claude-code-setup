#!/bin/bash
# =============================================================================
# Enforce Plan Spec
# Description: Block ExitPlanMode unless a valid spec exists in .claude/plans/
# Called by: PreToolUse hook on ExitPlanMode
# Exit codes:
#   0 = spec passes audit (allow exit)
#   1 = no spec found (warn, allow exit — covers research/docs/config exceptions)
#   2 = spec exists but fails audit (BLOCK exit)
# =============================================================================

PLANS_DIR=".claude/plans"
AUDIT_SCRIPT="./.claude/scripts/audit-spec.sh"

# Find most recent plan file
latest=""
if [[ -d "$PLANS_DIR" ]]; then
    latest=$(find "$PLANS_DIR" -name "*.md" -type f -print0 2>/dev/null \
        | xargs -0 ls -t 2>/dev/null \
        | head -n 1)
fi

# No spec found — warn but allow (covers research/docs/config-only exceptions)
if [[ -z "$latest" ]]; then
    echo "[Hook] WARNING: No spec found in .claude/plans/" >&2
    echo "[Hook] Plan mode should produce a spec using .claude/templates/spec.md.template" >&2
    echo "[Hook] Exception allowed for: research, docs-only, config-only tasks" >&2
    exit 1
fi

# Spec found — run audit
echo "[Hook] Auditing spec before exiting plan mode: ${latest#./}" >&2
echo "" >&2

if bash "$AUDIT_SCRIPT" "$latest" >&2; then
    echo "" >&2
    echo "[Hook] Spec passed. Exiting plan mode." >&2
    exit 0
else
    audit_exit=$?
    echo "" >&2
    if [[ $audit_exit -eq 2 ]]; then
        echo "[Hook] BLOCKED: Spec has unverified requirements — cannot exit plan mode." >&2
        echo "[Hook] Fix the issues above, then try ExitPlanMode again." >&2
        exit 2
    else
        # exit 1 from audit = warnings only, allow through
        echo "[Hook] Spec has minor warnings. Proceeding." >&2
        exit 0
    fi
fi
