#!/bin/bash
# =============================================================================
# Merge Parallel TDD Branches
# Description: Merge branches from parallel TDD sessions back to the current branch.
#              Detects conflicts, runs tests after each merge, and reports results.
#
# Usage:
#   ./.claude/scripts/merge-parallel.sh                       # auto-detect branches
#   ./.claude/scripts/merge-parallel.sh branch1 branch2 ...   # merge specific branches
#
# Exit codes: 0 = all merged, 1 = warnings, 2 = merge failure
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
    BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

log_pass() { echo -e "${GREEN}[OK]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_fail() { echo -e "${RED}[FAIL]${NC} $*" >&2; }
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_head() { echo -e "\n${BOLD}$*${NC}"; }

# =============================================================================
# Find branches to merge
# =============================================================================

find_agent_branches() {
    # Find branches matching the parallel-tdd naming pattern
    git -C "$PROJECT_ROOT" branch --list 'feat/*-agent-*' 2>/dev/null | sed 's/^[ *]*//'
}

# =============================================================================
# Auto-detect test runner
# =============================================================================

detect_test_command() {
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        if grep -q '"test"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
            echo "npm test"
            return
        fi
    fi
    if [[ -f "$PROJECT_ROOT/Cargo.toml" ]]; then
        echo "cargo test"
        return
    fi
    if [[ -f "$PROJECT_ROOT/go.mod" ]]; then
        echo "go test ./..."
        return
    fi
    if [[ -f "$PROJECT_ROOT/pyproject.toml" ]] || [[ -f "$PROJECT_ROOT/setup.py" ]]; then
        echo "pytest"
        return
    fi
    echo ""
}

# =============================================================================
# Run tests
# =============================================================================

run_tests() {
    local test_cmd
    test_cmd=$(detect_test_command)

    if [[ -z "$test_cmd" ]]; then
        log_warn "No test runner detected — skipping post-merge tests"
        return 0
    fi

    log_info "Running tests: $test_cmd"
    if (cd "$PROJECT_ROOT" && eval "$test_cmd" >/dev/null 2>&1); then
        log_pass "Tests passing"
        return 0
    else
        log_fail "Tests failing after merge"
        return 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    log_head "Merge Parallel TDD Branches"
    echo ""

    cd "$PROJECT_ROOT"

    # Determine branches to merge
    local -a branches=()

    if [[ $# -gt 0 ]]; then
        # Explicit branch list
        branches=("$@")
    else
        # Auto-detect
        mapfile -t branches < <(find_agent_branches)
    fi

    if [[ ${#branches[@]} -eq 0 ]]; then
        log_warn "No agent branches found to merge"
        log_info "Expected branches matching: feat/*-agent-*"
        log_info "Or provide branch names: $0 branch1 branch2 ..."
        exit 1
    fi

    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    log_info "Current branch: $current_branch"
    log_info "Branches to merge: ${#branches[@]}"
    echo ""

    for branch in "${branches[@]}"; do
        log_info "  - $branch"
    done
    echo ""

    # Check for uncommitted changes
    if ! git diff --quiet HEAD 2>/dev/null; then
        log_fail "Uncommitted changes detected — commit or stash before merging"
        exit 2
    fi

    # Merge each branch
    local merged=0
    local failed=0
    local -a failed_branches=()
    local -a conflict_branches=()

    for branch in "${branches[@]}"; do
        log_head "Merging: $branch"

        # Check branch exists
        if ! git rev-parse --verify "$branch" >/dev/null 2>&1; then
            log_fail "Branch not found: $branch"
            failed=$((failed + 1))
            failed_branches+=("$branch (not found)")
            continue
        fi

        # Check if already merged
        if git merge-base --is-ancestor "$branch" HEAD 2>/dev/null; then
            log_warn "Already merged: $branch — skipping"
            continue
        fi

        # Attempt merge
        if git merge --no-ff "$branch" -m "merge: integrate parallel TDD branch $branch" 2>/dev/null; then
            log_pass "Merged: $branch"

            # Run tests after merge
            if ! run_tests; then
                log_warn "Tests failing after merging $branch — consider reverting"
                failed=$((failed + 1))
                failed_branches+=("$branch (tests failing)")
            else
                merged=$((merged + 1))
            fi
        else
            log_fail "Merge conflict with: $branch"
            git merge --abort 2>/dev/null || true
            failed=$((failed + 1))
            conflict_branches+=("$branch")
            failed_branches+=("$branch (conflict)")
        fi
    done

    # Summary
    echo ""
    log_head "Summary"
    echo "  Total branches:   ${#branches[@]}"
    echo "  Merged OK:        $merged"
    echo "  Failed:           $failed"
    echo ""

    if [[ ${#conflict_branches[@]} -gt 0 ]]; then
        echo -e "${BOLD}Branches with conflicts (merge manually):${NC}"
        for branch in "${conflict_branches[@]}"; do
            echo "  git merge $branch"
            echo "  # Resolve conflicts, then: git add . && git commit"
        done
        echo ""
    fi

    if [[ $failed -gt 0 ]]; then
        echo -e "${RED}MERGE INCOMPLETE: $failed branch(es) need attention${NC}"
        exit 2
    else
        echo -e "${GREEN}ALL BRANCHES MERGED SUCCESSFULLY${NC}"

        # Suggest cleanup
        echo ""
        echo "Clean up worktrees and branches:"
        echo "  git worktree prune"
        for branch in "${branches[@]}"; do
            echo "  git branch -d $branch"
        done

        # Suggest traceability check
        echo ""
        echo "Verify traceability:"
        echo "  bash .claude/scripts/verify-traceability.sh"
    fi

    exit 0
}

main "$@"
