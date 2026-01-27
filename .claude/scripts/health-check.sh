#!/bin/bash
# =============================================================================
# System Health Check
# Description: Validate .claude/ configuration integrity
# Usage: ./.claude/scripts/health-check.sh [--quick]
# Exit Codes: 0 = healthy, 1 = degraded (warnings), 2 = unhealthy (errors)
# =============================================================================

set -euo pipefail

# Constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly CLAUDE_DIR="$PROJECT_ROOT/.claude"
readonly MAX_FILE_LINES=300

# Colors (if terminal supports it)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

# Counters
ERRORS=0
WARNINGS=0
INFO=0

# =============================================================================
# Helper Functions
# =============================================================================

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
    ((WARNINGS++)) || true
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $*" >&2
    ((ERRORS++)) || true
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
    ((INFO++)) || true
}

section() {
    echo ""
    echo -e "${BLUE}--- $* ---${NC}"
}

# =============================================================================
# Check 1: Skill Reference Integrity
# Parse agent frontmatter skills: fields, verify each skill file exists
# =============================================================================

check_skill_references() {
    section "Skill Reference Integrity"

    local found_issues=0
    local agents_dir="$CLAUDE_DIR/agents"
    local skills_dir="$CLAUDE_DIR/skills"

    if [[ ! -d "$agents_dir" ]]; then
        log_fail "Agents directory not found: $agents_dir"
        return
    fi

    for agent_file in "$agents_dir"/*.md; do
        [[ -f "$agent_file" ]] || continue
        local basename
        basename=$(basename "$agent_file")
        [[ "$basename" == "INDEX.md" || "$basename" == "README.md" ]] && continue

        # Extract skills from YAML frontmatter
        local in_frontmatter=0
        local in_skills=0
        while IFS= read -r line; do
            if [[ "$line" == "---" ]]; then
                if [[ $in_frontmatter -eq 1 ]]; then
                    break
                fi
                in_frontmatter=1
                continue
            fi
            if [[ $in_frontmatter -eq 1 ]]; then
                if [[ "$line" =~ ^skills: ]]; then
                    in_skills=1
                    continue
                fi
                if [[ $in_skills -eq 1 ]]; then
                    if [[ "$line" =~ ^[[:space:]]+- ]]; then
                        local skill_name
                        skill_name=$(echo "$line" | sed 's/^[[:space:]]*-[[:space:]]*//' | tr -d '[:space:]')
                        if [[ -n "$skill_name" && ! -f "$skills_dir/$skill_name.md" ]]; then
                            log_fail "Agent '$basename' references skill '$skill_name' — file not found: $skills_dir/$skill_name.md"
                            found_issues=1
                        fi
                    else
                        in_skills=0
                    fi
                fi
            fi
        done < "$agent_file"
    done

    if [[ $found_issues -eq 0 ]]; then
        log_pass "All agent skill references are valid"
    fi
}

# =============================================================================
# Check 2: INDEX.md Consistency
# Compare INDEX.md listed agents vs actual files in .claude/agents/
# =============================================================================

check_index_consistency() {
    section "INDEX.md Consistency"

    local found_issues=0

    # Check agents INDEX
    local agents_index="$CLAUDE_DIR/agents/INDEX.md"
    local agents_dir="$CLAUDE_DIR/agents"

    if [[ -f "$agents_index" && -d "$agents_dir" ]]; then
        # Get actual agent files (exclude INDEX.md, README.md)
        local actual_agents=()
        for f in "$agents_dir"/*.md; do
            [[ -f "$f" ]] || continue
            local bn
            bn=$(basename "$f" .md)
            [[ "$bn" == "INDEX" || "$bn" == "README" ]] && continue
            actual_agents+=("$bn")
        done

        # Check each actual agent is mentioned in INDEX.md
        for agent in "${actual_agents[@]}"; do
            if ! grep -q "$agent" "$agents_index" 2>/dev/null; then
                log_warn "Agent '$agent' exists as a file but is not listed in agents/INDEX.md"
                found_issues=1
            fi
        done

        # Check agent count in INDEX header
        local stated_count
        stated_count=$(grep -oP '\d+(?=\s+specialized\s+agents)' "$agents_index" 2>/dev/null || echo "")
        local actual_count=${#actual_agents[@]}
        if [[ -n "$stated_count" && "$stated_count" -ne "$actual_count" ]]; then
            log_warn "INDEX.md states $stated_count agents but found $actual_count agent files"
            found_issues=1
        fi
    fi

    # Check skills INDEX
    local skills_index="$CLAUDE_DIR/skills/INDEX.md"
    local skills_dir="$CLAUDE_DIR/skills"

    if [[ -f "$skills_index" && -d "$skills_dir" ]]; then
        local actual_skills=()
        for f in "$skills_dir"/*.md; do
            [[ -f "$f" ]] || continue
            local bn
            bn=$(basename "$f" .md)
            [[ "$bn" == "INDEX" || "$bn" == "README" ]] && continue
            actual_skills+=("$bn")
        done

        for skill in "${actual_skills[@]}"; do
            if ! grep -q "$skill" "$skills_index" 2>/dev/null; then
                log_warn "Skill '$skill' exists as a file but is not listed in skills/INDEX.md"
                found_issues=1
            fi
        done
    fi

    if [[ $found_issues -eq 0 ]]; then
        log_pass "INDEX files are consistent with filesystem"
    fi
}

# =============================================================================
# Check 3: Script Syntax Validation
# Run bash -n on all .sh files
# =============================================================================

check_script_syntax() {
    section "Script Syntax Validation"

    local found_issues=0
    local scripts_dir="$CLAUDE_DIR/scripts"

    if [[ ! -d "$scripts_dir" ]]; then
        log_info "No scripts directory found"
        return
    fi

    for script in "$scripts_dir"/*.sh; do
        [[ -f "$script" ]] || continue
        local bn
        bn=$(basename "$script")
        if bash -n "$script" 2>/dev/null; then
            log_pass "Script syntax OK: $bn"
        else
            log_fail "Script syntax error: $bn"
            found_issues=1
        fi
    done

    if [[ $found_issues -eq 0 && $(ls "$scripts_dir"/*.sh 2>/dev/null | wc -l) -gt 0 ]]; then
        log_pass "All scripts have valid syntax"
    fi
}

# =============================================================================
# Check 4: Hook Path Validity
# Parse settings.json hooks, verify script paths exist
# =============================================================================

check_hook_paths() {
    section "Hook Path Validity"

    local settings="$CLAUDE_DIR/settings.json"
    local settings_local="$CLAUDE_DIR/settings.local.json"
    local found_issues=0

    for sfile in "$settings" "$settings_local"; do
        [[ -f "$sfile" ]] || continue
        local bn
        bn=$(basename "$sfile")

        # Extract script paths from hooks (look for .sh or .claude/scripts references)
        local paths
        paths=$(grep -oP '(?:\.claude/scripts/|\./)[\w\-./]+\.sh' "$sfile" 2>/dev/null || true)

        if [[ -n "$paths" ]]; then
            while IFS= read -r path; do
                local full_path="$PROJECT_ROOT/$path"
                if [[ ! -f "$full_path" ]]; then
                    log_fail "Hook in $bn references missing script: $path"
                    found_issues=1
                fi
            done <<< "$paths"
        fi
    done

    if [[ $found_issues -eq 0 ]]; then
        log_pass "All hook script paths are valid"
    fi
}

# =============================================================================
# Check 5: File Size Check
# Flag any .claude/ file exceeding MAX_FILE_LINES lines
# =============================================================================

check_file_sizes() {
    section "File Size Check (max $MAX_FILE_LINES lines)"

    local found_issues=0

    while IFS= read -r -d '' file; do
        local line_count
        line_count=$(wc -l < "$file" 2>/dev/null || echo 0)
        if [[ $line_count -gt $MAX_FILE_LINES ]]; then
            local relpath="${file#$PROJECT_ROOT/}"
            log_warn "File exceeds $MAX_FILE_LINES lines ($line_count): $relpath"
            found_issues=1
        fi
    done < <(find "$CLAUDE_DIR" -type f -name "*.md" -print0 2>/dev/null)

    while IFS= read -r -d '' file; do
        local line_count
        line_count=$(wc -l < "$file" 2>/dev/null || echo 0)
        if [[ $line_count -gt $MAX_FILE_LINES ]]; then
            local relpath="${file#$PROJECT_ROOT/}"
            log_warn "File exceeds $MAX_FILE_LINES lines ($line_count): $relpath"
            found_issues=1
        fi
    done < <(find "$CLAUDE_DIR" -type f -name "*.sh" -print0 2>/dev/null)

    if [[ $found_issues -eq 0 ]]; then
        log_pass "All files are within size limits"
    fi
}

# =============================================================================
# Check 6: Dead Reference Scan
# Scan all .md files for .claude/ path references, verify targets exist
# =============================================================================

check_dead_references() {
    section "Dead Reference Scan"

    local found_issues=0

    while IFS= read -r -d '' file; do
        local relfile="${file#$PROJECT_ROOT/}"

        # Extract .claude/ path references from markdown
        local refs
        refs=$(grep -oP '\.claude/[\w\-./]+\.\w+' "$file" 2>/dev/null || true)

        if [[ -n "$refs" ]]; then
            while IFS= read -r ref; do
                local full_ref="$PROJECT_ROOT/$ref"
                if [[ ! -f "$full_ref" && ! -d "$full_ref" ]]; then
                    log_warn "Dead reference in $relfile: $ref"
                    found_issues=1
                fi
            done <<< "$refs"
        fi
    done < <(find "$CLAUDE_DIR" -type f -name "*.md" -print0 2>/dev/null)

    # Also check CLAUDE.md at root
    if [[ -f "$PROJECT_ROOT/CLAUDE.md" ]]; then
        local refs
        refs=$(grep -oP '\.claude/[\w\-./]+\.\w+' "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null || true)
        if [[ -n "$refs" ]]; then
            while IFS= read -r ref; do
                local full_ref="$PROJECT_ROOT/$ref"
                if [[ ! -f "$full_ref" && ! -d "$full_ref" ]]; then
                    log_warn "Dead reference in CLAUDE.md: $ref"
                    found_issues=1
                fi
            done <<< "$refs"
        fi
    fi

    if [[ $found_issues -eq 0 ]]; then
        log_pass "No dead references found"
    fi
}

# =============================================================================
# Check 7: Orphan Detection
# Find files in agents/skills/commands/templates not referenced by any other file
# =============================================================================

check_orphans() {
    section "Orphan Detection"

    local found_issues=0
    local dirs=("agents" "skills" "commands")

    for dir in "${dirs[@]}"; do
        local dir_path="$CLAUDE_DIR/$dir"
        [[ -d "$dir_path" ]] || continue

        for file in "$dir_path"/*.md; do
            [[ -f "$file" ]] || continue
            local bn
            bn=$(basename "$file" .md)
            [[ "$bn" == "INDEX" || "$bn" == "README" ]] && continue

            # Search for references to this file across .claude/ and root files
            local ref_count=0
            ref_count=$(grep -rl "$bn" "$CLAUDE_DIR" --include="*.md" 2>/dev/null | grep -v "$file" | wc -l || echo 0)

            # Also check CLAUDE.md
            if grep -q "$bn" "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null; then
                ref_count=$((ref_count + 1))
            fi

            if [[ $ref_count -eq 0 ]]; then
                log_info "Orphan: $dir/$bn.md (not referenced by any other file)"
                found_issues=1
            fi
        done
    done

    if [[ $found_issues -eq 0 ]]; then
        log_pass "No orphaned components detected"
    fi
}

# =============================================================================
# Check 8: Component Count Summary
# Report totals for tracking system complexity
# =============================================================================

check_component_counts() {
    section "Component Summary"

    local total_files=0
    local total_lines=0

    local dirs=("agents" "skills" "commands" "workflows" "checklists" "templates" "scripts" "rules" "health")
    for dir in "${dirs[@]}"; do
        local dir_path="$CLAUDE_DIR/$dir"
        if [[ -d "$dir_path" ]]; then
            local count
            count=$(find "$dir_path" -type f | wc -l)
            local lines
            lines=$(find "$dir_path" -type f -exec cat {} + 2>/dev/null | wc -l || echo 0)
            echo "  $dir: $count files, $lines lines"
            total_files=$((total_files + count))
            total_lines=$((total_lines + lines))
        fi
    done

    echo ""
    echo "  Total .claude/ files: $total_files"
    echo "  Total .claude/ lines: $total_lines"

    if [[ $total_files -gt 200 ]]; then
        log_warn "Component count ($total_files) exceeds 200 file budget"
    fi

    if [[ $total_lines -gt 12000 ]]; then
        log_warn "Total line count ($total_lines) exceeds 12,000 line budget"
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo "=============================================="
    echo "System Health Check"
    echo "=============================================="
    echo "Project: $PROJECT_ROOT"
    echo "Date:    $(date '+%Y-%m-%d %H:%M:%S')"

    cd "$PROJECT_ROOT"

    # Core structural checks (always run)
    check_skill_references
    check_index_consistency
    check_script_syntax
    check_hook_paths
    check_file_sizes
    check_dead_references

    # Extended checks (skip with --quick)
    if [[ "${1:-}" != "--quick" ]]; then
        check_orphans
        check_component_counts
    fi

    # Summary
    echo ""
    echo "=============================================="
    echo "Summary"
    echo "=============================================="

    if [[ $ERRORS -gt 0 ]]; then
        echo -e "Status: ${RED}UNHEALTHY${NC}"
        echo -e "  ${RED}$ERRORS error(s)${NC}, ${YELLOW}$WARNINGS warning(s)${NC}, ${BLUE}$INFO info${NC}"
        exit 2
    elif [[ $WARNINGS -gt 0 ]]; then
        echo -e "Status: ${YELLOW}DEGRADED${NC}"
        echo -e "  ${YELLOW}$WARNINGS warning(s)${NC}, ${BLUE}$INFO info${NC}"
        exit 1
    else
        echo -e "Status: ${GREEN}HEALTHY${NC}"
        echo -e "  ${GREEN}All checks passed${NC}, ${BLUE}$INFO info${NC}"
        exit 0
    fi
}

main "$@"
