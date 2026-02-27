#!/bin/bash
# =============================================================================
# Parallel TDD
# Description: Split a spec into workstreams, create isolated git worktrees,
#              and launch Claude in new VS Code terminal tabs automatically.
#
# Usage: ./.claude/scripts/parallel-tdd.sh [--agents N] [--tmux] [--no-attach] [spec-file]
#
# Examples:
#   ./.claude/scripts/parallel-tdd.sh .claude/plans/auth.md
#   ./.claude/scripts/parallel-tdd.sh .claude/plans/auth.md --agents 4
#   ./.claude/scripts/parallel-tdd.sh .claude/plans/auth.md --tmux
#
# Requirements: git, claude CLI
# Auto-detects launch method per OS:
#   macOS:   osascript → opens VS Code terminal tabs
#   Windows: wt.exe (Windows Terminal) → new tabs; else print instructions
#   Linux:   xdotool → or tmux → or print instructions
#   --tmux:  force tmux on any OS
#
# Exit codes: 0 = success, 1 = validation error, 2 = runtime error
# =============================================================================

set -euo pipefail

# --- Argument parsing ---------------------------------------------------------
SPEC_FILE=""
NUM_AGENTS=3
NO_ATTACH=false
FORCE_TMUX=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --agents|-a)    NUM_AGENTS="$2"; shift 2 ;;
        --no-attach|-n) NO_ATTACH=true; shift ;;
        --tmux)         FORCE_TMUX=true; shift ;;
        *)              SPEC_FILE="$1"; shift ;;
    esac
done

# --- Paths --------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WORKTREES_DIR="$PROJECT_ROOT/.worktrees"
TMP_DIR="/tmp/parallel-tdd"

# --- Colors -------------------------------------------------------------------
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
    BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

log_info() { echo -e "${BLUE}▸${NC} $*"; }
log_ok()   { echo -e "${GREEN}✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*" >&2; }
log_err()  { echo -e "${RED}✗${NC} $*" >&2; }
log_head() { echo -e "\n${BOLD}$*${NC}"; }

# Globals
declare -a WORKTREE_PATHS=()
declare -a BRANCH_NAMES=()
declare -a WORKSTREAMS=()

# =============================================================================
# OS + launch mode detection
# =============================================================================

detect_os() {
    case "$(uname -s)" in
        Darwin)  echo "macos" ;;
        Linux)
            if grep -qi microsoft /proc/version 2>/dev/null; then
                echo "wsl"
            else
                echo "linux"
            fi ;;
        MINGW*|MSYS*|CYGWIN*) echo "gitbash" ;;
        *)       echo "unknown" ;;
    esac
}

# Convert a Unix path to a Windows path (for Git Bash / WSL)
to_win_path() {
    local path="$1"
    if command -v wslpath &>/dev/null; then
        wslpath -w "$path"
    elif command -v cygpath &>/dev/null; then
        cygpath -w "$path"
    else
        # Rough fallback for MINGW
        echo "$path" | sed 's|^/\([a-zA-Z]\)/|\1:/|; s|/|\\|g'
    fi
}

detect_launch_mode() {
    local os
    os=$(detect_os)

    if [[ "$FORCE_TMUX" == "true" ]]; then
        echo "tmux"; return
    fi

    case "$os" in
        macos)
            if pgrep -x "Code" &>/dev/null; then echo "vscode-mac"
            elif command -v tmux &>/dev/null;  then echo "tmux"
            else echo "print"; fi ;;

        wsl|gitbash)
            if command -v wt.exe &>/dev/null || command -v wt &>/dev/null; then
                echo "windows-wt"
            else
                echo "print"
            fi ;;

        linux)
            if command -v xdotool &>/dev/null && pgrep -x "code" &>/dev/null; then
                echo "vscode-linux"
            elif command -v tmux &>/dev/null; then
                echo "tmux"
            else
                echo "print"
            fi ;;

        *) echo "print" ;;
    esac
}

# =============================================================================
# Validation
# =============================================================================

validate() {
    local errors=0

    if [[ -z "$SPEC_FILE" ]]; then
        log_err "Usage: $0 [--agents N] [spec-file]"
        log_err "Example: $0 .claude/plans/auth.md"
        exit 1
    fi

    [[ -f "$SPEC_FILE" ]] || { log_err "Spec file not found: $SPEC_FILE"; ((errors++)); }
    command -v claude &>/dev/null || { log_err "claude CLI not found"; ((errors++)); }

    if ! git -C "$PROJECT_ROOT" rev-parse --git-dir &>/dev/null; then
        log_err "Not a git repository: $PROJECT_ROOT"
        ((errors++))
    fi

    if ! [[ "$NUM_AGENTS" =~ ^[0-9]+$ ]] || [[ "$NUM_AGENTS" -lt 1 ]] || [[ "$NUM_AGENTS" -gt 8 ]]; then
        log_err "--agents must be 1–8, got: $NUM_AGENTS"
        ((errors++))
    fi

    if [[ "$FORCE_TMUX" == "true" ]] && ! command -v tmux &>/dev/null; then
        log_err "--tmux specified but tmux is not installed"
        ((errors++))
    fi

    [[ $errors -eq 0 ]] || exit 1

    if ! git -C "$PROJECT_ROOT" diff --quiet HEAD 2>/dev/null; then
        log_warn "Uncommitted changes — worktrees will branch from current HEAD"
    fi
}

# =============================================================================
# Parse + distribute REQs
# =============================================================================

parse_reqs() {
    grep -oE 'REQ-[0-9]{3}' "$SPEC_FILE" | sort -u
}

distribute_reqs() {
    local -a reqs=("$@")
    local total=${#reqs[@]}

    if [[ $total -eq 0 ]]; then
        log_err "No REQ-XXX IDs found in $SPEC_FILE — run audit-spec.sh first"
        exit 1
    fi

    if [[ $total -lt $NUM_AGENTS ]]; then
        log_warn "$total REQs — reducing agents from $NUM_AGENTS to $total"
        NUM_AGENTS=$total
    fi

    for ((i=0; i<NUM_AGENTS; i++)); do WORKSTREAMS[$i]=""; done

    for ((i=0; i<total; i++)); do
        local bucket=$(( i % NUM_AGENTS ))
        if [[ -z "${WORKSTREAMS[$bucket]}" ]]; then
            WORKSTREAMS[$bucket]="${reqs[$i]}"
        else
            WORKSTREAMS[$bucket]="${WORKSTREAMS[$bucket]}, ${reqs[$i]}"
        fi
    done
}

# =============================================================================
# Create git worktrees
# =============================================================================

create_worktrees() {
    local feature="$1"
    mkdir -p "$WORKTREES_DIR"

    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        local branch="feat/${feature}-agent-${agent_n}"
        local path="$WORKTREES_DIR/${feature}-agent-${agent_n}"

        if [[ -d "$path" ]]; then
            log_warn "Removing stale worktree: $path"
            git -C "$PROJECT_ROOT" worktree remove --force "$path" 2>/dev/null || rm -rf "$path"
            git -C "$PROJECT_ROOT" branch -D "$branch" 2>/dev/null || true
        fi

        log_info "Worktree $agent_n → $branch"
        git -C "$PROJECT_ROOT" worktree add -b "$branch" "$path" HEAD

        WORKTREE_PATHS+=("$path")
        BRANCH_NAMES+=("$branch")
    done
}

# =============================================================================
# Write task files + startup scripts
# =============================================================================

write_agent_files() {
    local spec_abs="$1"
    mkdir -p "$TMP_DIR"

    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        local path="${WORKTREE_PATHS[$i]}"
        local branch="${BRANCH_NAMES[$i]}"
        local reqs="${WORKSTREAMS[$i]}"

        # Task briefing file (Claude reads this)
        cat > "$path/.claude-task.md" <<TASK
# Agent ${agent_n} Assignment

You are implementing specific requirements using strict TDD in an isolated git worktree.

## Context
- **Spec**: ${spec_abs}
- **Your requirements**: ${reqs}
- **Branch**: ${branch}

## Instructions
1. Read the full spec at \`${spec_abs}\` for context
2. Implement ONLY: **${reqs}**
3. For each requirement: failing test first → minimal code → refactor
4. Name tests: \`test('REQ-XXX: observable behavior', () => { ... })\`
5. Do NOT implement requirements outside your assignment
6. When done: \`git commit -m "feat: implement ${reqs}"\`

Start by reading the spec and confirming which behaviors you will implement.
TASK

        # Startup shell script (opened in each terminal tab)
        local startup="$TMP_DIR/agent-${agent_n}.sh"
        cat > "$startup" <<STARTUP
#!/bin/bash
cd "$path"
clear
printf '\033[1m=== Parallel TDD — Agent ${agent_n} of ${NUM_AGENTS} ===\033[0m\n'
printf 'Requirements: ${reqs}\n'
printf 'Branch:       ${branch}\n'
printf 'Worktree:     ${path}\n\n'
printf 'Starting Claude...\n\n'
claude
STARTUP
        chmod +x "$startup"
    done
}

# =============================================================================
# Launch: VS Code (macOS osascript)
# =============================================================================

launch_vscode() {
    local feature="$1"

    log_info "Opening VS Code terminal tabs..."

    # Check accessibility permissions (needed for System Events to control VS Code)
    if ! osascript -e 'tell application "System Events" to return true' &>/dev/null 2>&1; then
        log_warn "Accessibility access required."
        log_warn "Go to: System Settings → Privacy & Security → Accessibility → enable Terminal (or your terminal app)"
        log_warn "Then re-run this script."
        launch_print "$feature"
        return
    fi

    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        local startup="$TMP_DIR/agent-${agent_n}.sh"

        osascript <<APPLESCRIPT
tell application "Visual Studio Code"
    activate
end tell
delay 0.5
tell application "System Events"
    tell process "Code"
        click menu item "New Terminal" of menu 1 of menu bar item "Terminal" of menu bar 1
        delay 1.2
        keystroke "bash $startup"
        key code 36
        delay 2.5
        keystroke "Read .claude-task.md and begin implementing your assigned requirements."
        key code 36
    end tell
end tell
APPLESCRIPT

        log_ok "Agent $agent_n terminal opened (${WORKSTREAMS[$i]})"
        sleep 0.5
    done
}

# =============================================================================
# Launch: tmux
# =============================================================================

launch_tmux() {
    local feature="$1"
    local session="tdd-${feature}"

    tmux kill-session -t "$session" 2>/dev/null || true
    tmux new-session -d -s "$session" -x 220 -y 50 -c "$PROJECT_ROOT"
    tmux rename-window -t "$session:0" "integration"

    # Integration window
    tmux send-keys -t "$session:0" "clear" Enter
    tmux send-keys -t "$session:0" "echo '=== Integration — merge branches when agents done ==='" Enter
    for ((i=0; i<NUM_AGENTS; i++)); do
        tmux send-keys -t "$session:0" \
            "echo '  Agent $((i+1)): ${WORKSTREAMS[$i]} → ${BRANCH_NAMES[$i]}'" Enter
    done

    # Agent windows
    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        local startup="$TMP_DIR/agent-${agent_n}.sh"

        tmux new-window -t "$session" -n "agent-${agent_n}"
        tmux send-keys -t "$session:agent-${agent_n}" "bash $startup" Enter
        sleep 1.5
        tmux send-keys -t "$session:agent-${agent_n}" \
            "Read .claude-task.md and begin implementing your assigned requirements." Enter
        log_ok "Agent $agent_n launched (${WORKSTREAMS[$i]})"
    done

    tmux select-window -t "$session:integration"

    if [[ "$NO_ATTACH" == "true" ]]; then
        log_ok "tmux session ready: tmux attach -t $session"
    elif [[ -z "${TMUX:-}" ]]; then
        tmux attach -t "$session"
    else
        tmux switch-client -t "$session"
    fi
}

# =============================================================================
# Launch: Windows Terminal (wt.exe) — Git Bash or WSL
# =============================================================================

launch_windows_wt() {
    local os
    os=$(detect_os)
    log_info "Opening Windows Terminal tabs..."

    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        local startup="$TMP_DIR/agent-${agent_n}.sh"

        # WSL: tell wt to open a WSL tab; Git Bash: use bash directly
        if [[ "$os" == "wsl" ]]; then
            wt.exe new-tab --title "Agent ${agent_n}: ${WORKSTREAMS[$i]}" -- wsl bash -c "bash '${startup}'; exec bash" &
        else
            wt.exe new-tab --title "Agent ${agent_n}: ${WORKSTREAMS[$i]}" -- bash -c "bash '${startup}'; exec bash" &
        fi

        log_ok "Agent $agent_n → Windows Terminal tab (${WORKSTREAMS[$i]})"
        sleep 0.4
    done
    wait
}

# =============================================================================
# Launch: Linux — xdotool into VS Code
# =============================================================================

launch_vscode_linux() {
    log_info "Opening VS Code terminal tabs via xdotool..."

    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        local startup="$TMP_DIR/agent-${agent_n}.sh"

        # Focus VS Code
        xdotool search --name "Visual Studio Code" windowfocus --sync 2>/dev/null || {
            log_warn "Could not focus VS Code — falling back to print"
            launch_print ""
            return
        }
        sleep 0.3

        # New terminal: Ctrl+Shift+`
        xdotool key ctrl+shift+grave
        sleep 1.2

        xdotool type --clearmodifiers "bash $startup"
        xdotool key Return
        sleep 2.5

        xdotool type --clearmodifiers "Read .claude-task.md and begin implementing your assigned requirements."
        xdotool key Return

        log_ok "Agent $agent_n → VS Code terminal (${WORKSTREAMS[$i]})"
        sleep 0.5
    done
}

# =============================================================================
# Launch: print instructions (fallback)
# =============================================================================

launch_print() {
    local feature="$1"
    log_head "Worktrees ready — open these in separate terminals:"
    echo ""
    for ((i=0; i<NUM_AGENTS; i++)); do
        local agent_n=$((i+1))
        echo "  Terminal $agent_n (${WORKSTREAMS[$i]}):"
        echo "    bash $TMP_DIR/agent-${agent_n}.sh"
        echo ""
    done
}

# =============================================================================
# Cleanup on error
# =============================================================================

cleanup_on_error() {
    local exit_code=$?
    [[ $exit_code -eq 0 ]] && return
    log_warn "Error — cleaning up worktrees..."
    for path in "${WORKTREE_PATHS[@]:-}"; do
        [[ -n "$path" && -d "$path" ]] || continue
        git -C "$PROJECT_ROOT" worktree remove --force "$path" 2>/dev/null || true
    done
    for branch in "${BRANCH_NAMES[@]:-}"; do
        [[ -n "$branch" ]] || continue
        git -C "$PROJECT_ROOT" branch -D "$branch" 2>/dev/null || true
    done
}

trap cleanup_on_error EXIT

# =============================================================================
# Summary
# =============================================================================

print_summary() {
    local feature="$1"
    local mode="$2"

    log_head "All agents launched"
    echo ""
    for ((i=0; i<NUM_AGENTS; i++)); do
        log_ok "Agent $((i+1)): ${WORKSTREAMS[$i]} → ${BRANCH_NAMES[$i]}"
    done
    echo ""
    echo "  When all agents finish, merge:"
    echo "    git checkout main"
    for branch in "${BRANCH_NAMES[@]}"; do
        echo "    git merge --no-ff $branch"
    done
    echo ""
    echo "  Clean up:"
    echo "    git worktree prune"
    for branch in "${BRANCH_NAMES[@]}"; do
        echo "    git branch -d $branch"
    done
}

# =============================================================================
# Main
# =============================================================================

main() {
    log_head "Parallel TDD"
    echo ""

    validate
    cd "$PROJECT_ROOT"

    local feature
    feature=$(basename "$SPEC_FILE" .md | tr '[:upper:]' '[:lower:]' | tr ' _' '-')
    local spec_abs
    spec_abs="$(cd "$(dirname "$SPEC_FILE")" && pwd)/$(basename "$SPEC_FILE")"

    local mode
    mode=$(detect_launch_mode)

    log_info "Spec:    $SPEC_FILE"
    log_info "Feature: $feature"
    log_info "Agents:  $NUM_AGENTS"
    log_info "Mode:    $mode"
    echo ""

    # Parse + distribute
    log_head "Parsing Requirements"
    mapfile -t req_array < <(parse_reqs)
    log_info "Found: ${req_array[*]}"
    distribute_reqs "${req_array[@]}"
    echo ""
    for ((i=0; i<NUM_AGENTS; i++)); do
        log_info "  Agent $((i+1)): ${WORKSTREAMS[$i]}"
    done

    # Worktrees
    echo ""
    log_head "Creating Worktrees"
    create_worktrees "$feature"

    # Agent files
    write_agent_files "$spec_abs"

    # Launch
    echo ""
    log_head "Launching Agents"
    case "$mode" in
        vscode-mac)   launch_vscode "$feature" ;;
        windows-wt)   launch_windows_wt ;;
        vscode-linux) launch_vscode_linux ;;
        tmux)         launch_tmux "$feature" ;;
        print)        launch_print "$feature" ;;
    esac

    print_summary "$feature" "$mode"
}

main "$@"
