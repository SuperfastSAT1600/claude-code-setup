#!/bin/bash
# =============================================================================
# Lint REQ Test Names
# Description: Check that test names follow REQ-XXX naming when a spec exists.
#              Warns about tests missing REQ prefixes in spec-driven projects.
# Usage: ./.claude/scripts/lint-req-tests.sh [--spec path/to/spec.md]
# Exit codes: 0 = all OK, 1 = warnings (tests without REQ prefix)
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly PLANS_DIR="$PROJECT_ROOT/.claude/plans"

# Colors
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
    BLUE='\033[0;34m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi

# Parse arguments
SPEC_FILE=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --spec|-s) SPEC_FILE="$2"; shift 2 ;;
        *)         SPEC_FILE="$1"; shift ;;
    esac
done

# Auto-detect spec if not provided
if [[ -z "$SPEC_FILE" ]] && [[ -d "$PLANS_DIR" ]]; then
    SPEC_FILE=$(find "$PLANS_DIR" -name "*.md" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)
fi

# If no spec exists, nothing to lint against
if [[ -z "$SPEC_FILE" ]] || [[ ! -f "$SPEC_FILE" ]]; then
    echo -e "${BLUE}[INFO]${NC} No spec found — REQ naming lint skipped"
    exit 0
fi

# Check if spec has REQ IDs
req_count=$(grep -cE 'REQ-[0-9]{3}' "$SPEC_FILE" 2>/dev/null || echo 0)
if [[ "$req_count" -eq 0 ]]; then
    echo -e "${BLUE}[INFO]${NC} Spec has no REQ-XXX IDs — lint skipped"
    exit 0
fi

echo "=============================================="
echo "REQ Test Naming Lint"
echo "=============================================="
echo ""
echo -e "${BLUE}[INFO]${NC} Spec: ${SPEC_FILE#$PROJECT_ROOT/} ($req_count REQs)"
echo ""

# Find test files
test_files=$(find "$PROJECT_ROOT" \
    -type f \
    \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.test.js" -o -name "*.test.jsx" \
       -o -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.spec.js" -o -name "*.spec.jsx" \
       -o -name "*_test.py" -o -name "test_*.py" \
       -o -name "*_test.go" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.worktrees/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.claude/*" \
    2>/dev/null)

if [[ -z "$test_files" ]]; then
    echo -e "${YELLOW}[WARN]${NC} No test files found in project"
    exit 0
fi

# Find test declarations missing REQ prefix
warnings=0
total_tests=0

while IFS= read -r file; do
    relpath="${file#$PROJECT_ROOT/}"

    # Extract test names (test('...'), it('...'), describe('...'))
    # Only flag test/it calls, not describe blocks
    tests_without_req=$(grep -nE "(test|it)\s*\(\s*['\"](?!REQ-)" "$file" 2>/dev/null || true)

    if [[ -n "$tests_without_req" ]]; then
        echo -e "${YELLOW}[WARN]${NC} $relpath"
        echo "$tests_without_req" | head -10 | while IFS= read -r line; do
            echo "       $line"
            warnings=$((warnings + 1))
        done
        echo ""
    fi

    # Count total tests
    file_tests=$(grep -cE "(test|it)\s*\(" "$file" 2>/dev/null || echo 0)
    total_tests=$((total_tests + file_tests))
done <<< "$test_files"

# Count tests WITH REQ prefix
tests_with_req=$(echo "$test_files" | xargs grep -cE "(test|it)\s*\(\s*['\"]REQ-" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')

echo "=============================================="
echo "Summary"
echo "=============================================="
echo "  Total tests:     $total_tests"
echo "  With REQ prefix: $tests_with_req"
echo "  Without REQ:     $((total_tests - tests_with_req))"
echo ""

if [[ $warnings -gt 0 ]]; then
    echo -e "${YELLOW}WARNING: Some tests lack REQ-XXX prefix${NC}"
    echo "When a spec exists, test names should follow: test('REQ-XXX: behavior', ...)"
    exit 1
else
    echo -e "${GREEN}All tests follow REQ-XXX naming convention${NC}"
    exit 0
fi
