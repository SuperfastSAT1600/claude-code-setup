#!/bin/bash
# =============================================================================
# Verify Traceability
# Description: Validate that spec REQ-XXX IDs have corresponding tests.
#              With --drift, also checks if spec descriptions changed since
#              tests were written (compares spec REQ titles against test names).
# Usage:
#   ./.claude/scripts/verify-traceability.sh [spec-file]
#   ./.claude/scripts/verify-traceability.sh --drift [spec-file]
# Exit codes: 0 = all REQs covered, 1 = warnings, 2 = uncovered REQs
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly PLANS_DIR="$PROJECT_ROOT/.claude/plans"

# Parse flags
DRIFT_MODE=false
SPEC_ARG=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --drift|-d) DRIFT_MODE=true; shift ;;
        *)          SPEC_ARG="$1"; shift ;;
    esac
done
# Re-set positional param for find_spec_file
set -- ${SPEC_ARG:+"$SPEC_ARG"}

# Colors
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
    BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

log_pass() { echo -e "${GREEN}[PASS]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_fail() { echo -e "${RED}[FAIL]${NC} $*" >&2; }
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }

# =============================================================================
# Find spec file (reuse logic from audit-spec.sh)
# =============================================================================

find_spec_file() {
    local spec_path="${1:-}"

    if [[ -n "$spec_path" ]]; then
        if [[ -f "$spec_path" ]]; then
            echo "$spec_path"
            return 0
        else
            log_fail "Spec file not found: $spec_path"
            return 1
        fi
    fi

    if [[ ! -d "$PLANS_DIR" ]]; then
        log_fail "Plans directory not found: $PLANS_DIR"
        return 1
    fi

    local latest
    latest=$(find "$PLANS_DIR" -name "*.md" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)

    if [[ -z "$latest" ]]; then
        log_fail "No spec files found in $PLANS_DIR"
        return 1
    fi

    echo "$latest"
}

# =============================================================================
# Find test files in the project
# =============================================================================

find_test_files() {
    # Search common test file patterns
    find "$PROJECT_ROOT" \
        -type f \
        \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.test.js" -o -name "*.test.jsx" \
           -o -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.spec.js" -o -name "*.spec.jsx" \
           -o -name "*_test.py" -o -name "test_*.py" \
           -o -name "*_test.go" \
           -o -name "*.test.rs" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.worktrees/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" \
        -not -path "*/.claude/*" \
        2>/dev/null
}

# =============================================================================
# Extract REQ IDs from spec
# =============================================================================

extract_spec_reqs() {
    local spec_file="$1"
    grep -oE 'REQ-[0-9]{3}' "$spec_file" 2>/dev/null | sort -u
}

# =============================================================================
# Extract REQ IDs from test files
# =============================================================================

extract_test_reqs() {
    local test_files
    test_files=$(find_test_files)

    if [[ -z "$test_files" ]]; then
        return
    fi

    echo "$test_files" | xargs grep -ohE 'REQ-[0-9]{3}' 2>/dev/null | sort -u
}

# =============================================================================
# Extract REQ IDs with their test file locations
# =============================================================================

extract_test_req_locations() {
    local test_files
    test_files=$(find_test_files)

    if [[ -z "$test_files" ]]; then
        return
    fi

    echo "$test_files" | xargs grep -nH 'REQ-[0-9]\{3\}' 2>/dev/null
}

# =============================================================================
# Extract verification tags from spec
# =============================================================================

extract_verification_tags() {
    local spec_file="$1"
    local req_id="$2"

    # Look for the verification tag near the REQ definition
    local tag
    tag=$(grep -A 5 "$req_id" "$spec_file" 2>/dev/null | grep -oE '\(TEST\)|\(BROWSER\)|\(MANUAL\)' | head -1)
    echo "${tag:-UNKNOWN}"
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo "=============================================="
    echo "Spec-to-Test Traceability Report"
    echo "=============================================="
    echo ""

    local spec_file
    spec_file=$(find_spec_file "${1:-}") || exit 2

    local relpath="${spec_file#$PROJECT_ROOT/}"
    log_info "Spec: $relpath"
    echo ""

    # Extract REQs from spec
    local spec_reqs
    spec_reqs=$(extract_spec_reqs "$spec_file")

    if [[ -z "$spec_reqs" ]]; then
        log_fail "No REQ-XXX IDs found in spec"
        exit 2
    fi

    local total_spec_reqs
    total_spec_reqs=$(echo "$spec_reqs" | wc -l | tr -d ' ')
    log_info "REQs in spec: $total_spec_reqs"

    # Extract REQs from test files
    local test_reqs
    test_reqs=$(extract_test_reqs)
    local test_locations
    test_locations=$(extract_test_req_locations)

    local total_test_reqs=0
    if [[ -n "$test_reqs" ]]; then
        total_test_reqs=$(echo "$test_reqs" | wc -l | tr -d ' ')
    fi
    log_info "REQs in tests: $total_test_reqs"
    echo ""

    # Compare: covered, uncovered, orphans
    local covered=0
    local uncovered=0
    local uncovered_list=""
    local covered_list=""

    echo -e "${BOLD}Coverage by REQ:${NC}"
    echo ""

    while IFS= read -r req_id; do
        local tag
        tag=$(extract_verification_tags "$spec_file" "$req_id")

        if echo "$test_reqs" | grep -q "^${req_id}$" 2>/dev/null; then
            # Find which test file(s) cover this REQ
            local locations
            locations=$(echo "$test_locations" | grep "$req_id" | sed "s|$PROJECT_ROOT/||g" | head -3)
            local loc_count
            loc_count=$(echo "$test_locations" | grep -c "$req_id" 2>/dev/null || echo 0)

            log_pass "$req_id $tag — $loc_count test(s)"
            if [[ -n "$locations" ]]; then
                echo "$locations" | while IFS= read -r loc; do
                    echo "       $loc"
                done
            fi
            covered=$((covered + 1))
            covered_list="${covered_list}${req_id}\n"
        else
            if [[ "$tag" == "(MANUAL)" ]]; then
                log_warn "$req_id $tag — manual verification (no automated test expected)"
            else
                log_fail "$req_id $tag — NO TESTS FOUND"
                uncovered=$((uncovered + 1))
                uncovered_list="${uncovered_list}${req_id}\n"
            fi
        fi
    done <<< "$spec_reqs"

    # Check for orphan tests (REQ in tests but not in spec)
    echo ""
    local orphan_count=0
    local orphan_list=""

    if [[ -n "$test_reqs" ]]; then
        while IFS= read -r test_req; do
            if ! echo "$spec_reqs" | grep -q "^${test_req}$" 2>/dev/null; then
                orphan_count=$((orphan_count + 1))
                orphan_list="${orphan_list}${test_req}\n"
            fi
        done <<< "$test_reqs"
    fi

    if [[ $orphan_count -gt 0 ]]; then
        echo -e "${BOLD}Orphan tests (REQ in test but not in spec):${NC}"
        echo -e "$orphan_list" | head -20 | while IFS= read -r orphan; do
            [[ -n "$orphan" ]] && log_warn "$orphan — referenced in tests but missing from spec"
        done
        echo ""
    fi

    # Summary
    echo "=============================================="
    echo "Summary"
    echo "=============================================="
    echo "  REQs in spec:     $total_spec_reqs"
    echo "  Covered by tests: $covered"
    echo "  Uncovered:        $uncovered"
    echo "  Orphan tests:     $orphan_count"
    echo ""

    local exit_code=0

    if [[ $uncovered -gt 0 ]]; then
        echo -e "${RED}FAILED: $uncovered REQ(s) have no tests${NC}"
        echo ""
        echo "Uncovered REQs:"
        echo -e "$uncovered_list" | while IFS= read -r ureq; do
            [[ -n "$ureq" ]] && echo "  - $ureq"
        done
        exit_code=2
    elif [[ $orphan_count -gt 0 ]]; then
        echo -e "${YELLOW}WARNINGS: $orphan_count orphan test(s) reference REQs not in spec${NC}"
        exit_code=1
    else
        echo -e "${GREEN}PASSED: All REQs have corresponding tests${NC}"
    fi

    # --- Spec Drift Detection (optional) ---
    if [[ "$DRIFT_MODE" == "true" ]] && [[ $covered -gt 0 ]]; then
        echo ""
        echo -e "${BOLD}Spec Drift Detection:${NC}"
        echo ""
        local drift_count=0

        while IFS= read -r req_id; do
            # Extract spec description (the title after REQ-XXX:)
            local spec_title
            spec_title=$(grep -E "### $req_id:" "$spec_file" 2>/dev/null | sed "s/### $req_id: //" | head -1)

            if [[ -z "$spec_title" ]]; then
                # Try alternate format: "REQ-XXX: title" in a list item
                spec_title=$(grep -E "^.*$req_id:" "$spec_file" 2>/dev/null | sed "s/.*$req_id: //" | head -1)
            fi

            if [[ -z "$spec_title" ]]; then
                continue
            fi

            # Extract test description (after "REQ-XXX: " in test names)
            local test_title
            if [[ -n "$test_locations" ]]; then
                test_title=$(echo "$test_locations" | grep "$req_id" | grep -oE "$req_id: [^'\"]*" | sed "s/$req_id: //" | head -1)
            fi

            if [[ -z "$test_title" ]]; then
                continue
            fi

            # Compare (case-insensitive, trim whitespace)
            local spec_norm test_norm
            spec_norm=$(echo "$spec_title" | tr '[:upper:]' '[:lower:]' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            test_norm=$(echo "$test_title" | tr '[:upper:]' '[:lower:]' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

            if [[ "$spec_norm" != "$test_norm" ]]; then
                drift_count=$((drift_count + 1))
                log_warn "$req_id drift detected"
                echo "       Spec: $spec_title"
                echo "       Test: $test_title"
            fi
        done <<< "$spec_reqs"

        if [[ $drift_count -eq 0 ]]; then
            log_pass "No spec drift detected — spec and test descriptions align"
        else
            log_warn "$drift_count REQ(s) have mismatched descriptions between spec and tests"
            echo "  Review these REQs to ensure tests still match current spec intent."
            [[ $exit_code -lt 1 ]] && exit_code=1
        fi
    fi

    exit $exit_code
}

main "$@"
