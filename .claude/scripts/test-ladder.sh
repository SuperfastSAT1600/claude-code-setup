#!/bin/bash
# =============================================================================
# Test Ladder — Progressive Test Escalation
# Description: Run tests in phases, each gating the next.
#              Phase 1: Unit → Phase 2: Integration → Phase 3: E2E → Phase 4: Manual
# Usage: ./.claude/scripts/test-ladder.sh [--spec path/to/spec.md]
# Exit codes: 0 = all passed, 1 = warnings, 2 = phase failed
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly PLANS_DIR="$PROJECT_ROOT/.claude/plans"

# Parse arguments
SPEC_FILE=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --spec|-s) SPEC_FILE="$2"; shift 2 ;;
        *)         SPEC_FILE="$1"; shift ;;
    esac
done

# Colors
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
    BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

log_pass() { echo -e "  ${GREEN}PASS${NC} $*"; }
log_fail() { echo -e "  ${RED}FAIL${NC} $*"; }
log_skip() { echo -e "  ${YELLOW}SKIP${NC} $*"; }
log_info() { echo -e "  ${BLUE}INFO${NC} $*"; }

# =============================================================================
# Detect test runners
# =============================================================================

detect_unit_test_cmd() {
    cd "$PROJECT_ROOT"
    if [[ -f "package.json" ]]; then
        if grep -q '"vitest"' package.json 2>/dev/null; then
            echo "npx vitest run"
            return
        fi
        if grep -q '"jest"' package.json 2>/dev/null; then
            echo "npx jest"
            return
        fi
        if grep -q '"test"' package.json 2>/dev/null; then
            echo "npm test"
            return
        fi
    fi
    if [[ -f "Cargo.toml" ]]; then echo "cargo test"; return; fi
    if [[ -f "go.mod" ]]; then echo "go test ./..."; return; fi
    if [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]] || [[ -f "requirements.txt" ]]; then
        echo "pytest"
        return
    fi
    echo ""
}

detect_integration_test_dir() {
    cd "$PROJECT_ROOT"
    for dir in "test/integration" "tests/integration" "__tests__/integration" "src/__tests__/integration"; do
        if [[ -d "$dir" ]]; then
            echo "$dir"
            return
        fi
    done
    echo ""
}

detect_e2e_cmd() {
    cd "$PROJECT_ROOT"
    if [[ -f "playwright.config.ts" ]] || [[ -f "playwright.config.js" ]]; then
        echo "npx playwright test"
        return
    fi
    if [[ -f "cypress.config.ts" ]] || [[ -f "cypress.config.js" ]] || [[ -d "cypress" ]]; then
        echo "npx cypress run"
        return
    fi
    echo ""
}

# =============================================================================
# Extract spec requirements by verification tag
# =============================================================================

extract_reqs_by_tag() {
    local spec_file="$1"
    local tag="$2"  # TEST, BROWSER, or MANUAL

    if [[ -z "$spec_file" ]] || [[ ! -f "$spec_file" ]]; then
        return
    fi

    # Find REQ lines followed by verification tag
    grep -B 2 "($tag)" "$spec_file" 2>/dev/null | grep -oE 'REQ-[0-9]{3}' | sort -u
}

# =============================================================================
# Run a phase
# =============================================================================

run_phase() {
    local phase_num="$1"
    local phase_name="$2"
    local cmd="$3"
    local start_time end_time duration

    echo ""
    echo -e "${BOLD}Phase $phase_num: $phase_name${NC}"

    if [[ -z "$cmd" ]]; then
        log_skip "No $phase_name runner detected"
        return 0  # Skip, not fail
    fi

    log_info "Running: $cmd"
    start_time=$(date +%s)

    local output
    local exit_code=0
    output=$(cd "$PROJECT_ROOT" && eval "$cmd" 2>&1) || exit_code=$?

    end_time=$(date +%s)
    duration=$((end_time - start_time))

    if [[ $exit_code -eq 0 ]]; then
        log_pass "$phase_name (${duration}s)"
        echo -e "  Gate: ${GREEN}PASSED${NC}"
        return 0
    else
        log_fail "$phase_name (${duration}s)"
        # Show last 20 lines of output for context
        echo "$output" | tail -20 | sed 's/^/  /'
        echo -e "  Gate: ${RED}FAILED${NC}"
        return 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo "=============================================="
    echo "Test Ladder — Progressive Escalation"
    echo "=============================================="

    local phases_passed=0
    local phases_total=0
    local manual_items=0
    local ladder_failed=false

    # --- Phase 1: Unit Tests ---
    phases_total=$((phases_total + 1))
    local unit_cmd
    unit_cmd=$(detect_unit_test_cmd)

    if run_phase 1 "Unit Tests" "$unit_cmd"; then
        phases_passed=$((phases_passed + 1))
    else
        ladder_failed=true
        echo ""
        echo -e "${RED}Ladder stopped at Phase 1.${NC}"
        echo "Fix unit test failures before proceeding."
    fi

    # --- Phase 2: Integration Tests (only if Phase 1 passed) ---
    if [[ "$ladder_failed" != "true" ]]; then
        phases_total=$((phases_total + 1))
        local int_dir
        int_dir=$(detect_integration_test_dir)
        local int_cmd=""

        if [[ -n "$int_dir" ]]; then
            # Use detected unit runner with integration dir
            if [[ -n "$unit_cmd" ]]; then
                if echo "$unit_cmd" | grep -q "vitest"; then
                    int_cmd="npx vitest run $int_dir"
                elif echo "$unit_cmd" | grep -q "jest"; then
                    int_cmd="npx jest --roots $int_dir"
                elif echo "$unit_cmd" | grep -q "pytest"; then
                    int_cmd="pytest $int_dir"
                else
                    int_cmd="$unit_cmd"
                fi
            fi
        fi

        if run_phase 2 "Integration Tests" "$int_cmd"; then
            phases_passed=$((phases_passed + 1))
        else
            ladder_failed=true
            echo ""
            echo -e "${RED}Ladder stopped at Phase 2.${NC}"
            echo "Fix integration test failures before proceeding."
        fi
    fi

    # --- Phase 3: E2E Tests (only if Phase 2 passed) ---
    if [[ "$ladder_failed" != "true" ]]; then
        phases_total=$((phases_total + 1))
        local e2e_cmd
        e2e_cmd=$(detect_e2e_cmd)

        if run_phase 3 "E2E Tests" "$e2e_cmd"; then
            phases_passed=$((phases_passed + 1))
        else
            ladder_failed=true
            echo ""
            echo -e "${RED}Ladder stopped at Phase 3.${NC}"
            echo "Fix E2E test failures before proceeding."
        fi
    fi

    # --- Phase 4: Manual Validation Checklist ---
    echo ""
    echo -e "${BOLD}Phase 4: Manual Validation${NC}"

    if [[ -n "$SPEC_FILE" ]] && [[ -f "$SPEC_FILE" ]]; then
        local manual_reqs
        manual_reqs=$(extract_reqs_by_tag "$SPEC_FILE" "MANUAL")

        if [[ -n "$manual_reqs" ]]; then
            manual_items=$(echo "$manual_reqs" | wc -l | tr -d ' ')
            echo "  From spec: $manual_items requirement(s) need manual verification"
            while IFS= read -r req_id; do
                # Extract description from spec
                local desc
                desc=$(grep -A 1 "### $req_id" "$SPEC_FILE" 2>/dev/null | grep "Description" | sed 's/.*Description\*\*: //' | head -1)
                echo "  - [ ] $req_id: ${desc:-manual check required} (MANUAL)"
            done <<< "$manual_reqs"
        else
            echo "  No (MANUAL) requirements found in spec"
        fi
    else
        echo "  No spec provided — use --spec to include manual checklist"
    fi

    # --- Summary ---
    echo ""
    echo "=============================================="
    echo "Summary"
    echo "=============================================="
    echo "  Phases passed: $phases_passed/$phases_total automated"
    if [[ $manual_items -gt 0 ]]; then
        echo "  Manual items:  $manual_items (require human review)"
    fi
    echo ""

    if [[ "$ladder_failed" == "true" ]]; then
        echo -e "${RED}LADDER FAILED: Fix failures before proceeding${NC}"
        exit 2
    else
        echo -e "${GREEN}ALL AUTOMATED PHASES PASSED${NC}"
        if [[ $manual_items -gt 0 ]]; then
            echo "Complete manual validation items above before marking feature done."
        fi
        exit 0
    fi
}

main "$@"
