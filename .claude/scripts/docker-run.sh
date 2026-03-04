#!/bin/bash
# ============================================================
# Claude Code in Docker (YOLO mode)
# ============================================================
#
# Uses your existing Claude login from the host — no extra setup.
#
#   ./docker-run.sh             ← then type "claude" inside
#   ./docker-run.sh --tmux      ← for agent teams
#   ./docker-run.sh --build     ← rebuild after Dockerfile changes
#
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMAGE_NAME="claude-code-yolo"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── Build image if needed ──────────────────────────────────
if [ "$1" = "--build" ]; then
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build -t "$IMAGE_NAME" -f "$PROJECT_ROOT/.devcontainer/Dockerfile" "$PROJECT_ROOT/.devcontainer"
    echo -e "${GREEN}Done!${NC}"
    shift
    [ $# -eq 0 ] && exit 0
fi

if ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo -e "${YELLOW}First run — building Docker image (takes ~1 min)...${NC}"
    docker build -t "$IMAGE_NAME" -f "$PROJECT_ROOT/.devcontainer/Dockerfile" "$PROJECT_ROOT/.devcontainer"
    echo -e "${GREEN}Done!${NC}"
fi

# ── Find host credentials ────────────────────────────────
HOST_CLAUDE_DIR="$HOME/.claude"

if [ ! -f "$HOST_CLAUDE_DIR/.credentials.json" ]; then
    echo ""
    echo -e "${RED}Not logged in.${NC} Run this first (outside Docker):"
    echo ""
    echo "  claude login"
    echo ""
    exit 1
fi

# ── Common docker args ────────────────────────────────────
# Mounts host ~/.claude READ-ONLY to a staging path.
# Entrypoint copies credentials to a container-local dir so
# multiple containers never conflict with each other.
DOCKER_ARGS=(
    --rm -it
    -v "$PROJECT_ROOT:/workspace"
    -v "$HOST_CLAUDE_DIR:/host-claude:ro"
    --memory=4g
    --cpus=2
    "$IMAGE_NAME"
)

# ── Start container ───────────────────────────────────────
echo ""
echo -e "${GREEN}Starting Claude Code container...${NC}"
echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo -e "  Your project is at ${GREEN}/workspace${NC}"
echo -e "  YOLO mode is ${YELLOW}ON${NC} (safe — you're inside Docker)"
echo ""

if [ "$1" = "--tmux" ]; then
    echo -e "  ${GREEN}tmux cheat sheet:${NC}"
    echo -e "    Split side-by-side:  ${YELLOW}Ctrl+B${NC} then ${YELLOW}%${NC}"
    echo -e "    Split top/bottom:    ${YELLOW}Ctrl+B${NC} then ${YELLOW}\"${NC}"
    echo -e "    Switch pane:         ${YELLOW}Ctrl+B${NC} then ${YELLOW}arrow key${NC}"
    echo -e "    Leave (keep alive):  ${YELLOW}Ctrl+B${NC} then ${YELLOW}d${NC}"
    echo -e "    Close pane:          type ${YELLOW}exit${NC}"
    echo ""
    echo -e "  Type ${GREEN}claude${NC} in each pane to start an agent."
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo ""
    docker run "${DOCKER_ARGS[@]}" tmux new-session -s claude
else
    echo -e "  Type ${GREEN}claude${NC} to start."
    echo -e "  Type ${YELLOW}exit${NC} to leave."
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo ""
    docker run "${DOCKER_ARGS[@]}" bash
fi
