#!/bin/bash
# ============================================================
# Claude Code in Docker (YOLO mode)
# ============================================================
#
# FIRST TIME (once ever):
#   ./docker-run.sh --login
#
# EVERY TIME AFTER:
#   ./docker-run.sh             ← then type "claude" inside
#   ./docker-run.sh --tmux      ← for agent teams
#
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMAGE_NAME="claude-code-yolo"
VOLUME_NAME="claude-credentials"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── Build image if needed ──────────────────────────────────
if [ "$1" = "--build" ]; then
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build -t "$IMAGE_NAME" -f "$PROJECT_ROOT/.devcontainer/Dockerfile" "$PROJECT_ROOT"
    echo -e "${GREEN}Done!${NC}"
    shift
    [ $# -eq 0 ] && exit 0
fi

if ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo -e "${YELLOW}First run — building Docker image (takes ~1 min)...${NC}"
    docker build -t "$IMAGE_NAME" -f "$PROJECT_ROOT/.devcontainer/Dockerfile" "$PROJECT_ROOT"
    echo -e "${GREEN}Done!${NC}"
fi

# ── Ensure credentials volume exists ──────────────────────
docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1 || \
    docker volume create "$VOLUME_NAME" > /dev/null

# ── Common docker args ────────────────────────────────────
# Runs as root inside container so it can write to mounted files.
# This is safe — root inside Docker ≠ root on your computer.
DOCKER_ARGS=(
    --rm -it
    -v "$PROJECT_ROOT:/workspace"
    -v "$VOLUME_NAME:/root/.claude"
    --memory=4g
    --cpus=2
    "$IMAGE_NAME"
)

# ── Login ──────────────────────────────────────────────────
if [ "$1" = "--login" ]; then
    echo ""
    echo -e "${GREEN}Logging in to Claude...${NC}"
    echo -e "${YELLOW}A URL will appear below. Open it in your browser and log in.${NC}"
    echo ""
    docker run "${DOCKER_ARGS[@]}" claude login
    echo ""
    echo -e "${GREEN}Logged in! Now just run:${NC}"
    echo "  ./docker-run.sh"
    exit 0
fi

# ── Check login ────────────────────────────────────────────
# Try to detect saved credentials (check common locations)
HAS_CREDS=$(docker run --rm \
    -v "$VOLUME_NAME:/root/.claude" \
    "$IMAGE_NAME" \
    sh -c 'test -f /root/.claude/.credentials.json -o -d /root/.claude/.credentials -o -f /root/.claude/credentials.json && echo yes || echo no' 2>/dev/null || echo no)

if [ "$HAS_CREDS" != "yes" ]; then
    echo ""
    echo -e "${YELLOW}Not logged in yet.${NC}"
    echo ""
    echo "  Step 1:  ./docker-run.sh --login"
    echo "  Step 2:  Open the URL it shows in your browser"
    echo "  Step 3:  Log in with your Claude account"
    echo "  Step 4:  Come back here and run:  ./docker-run.sh"
    echo ""
    exit 1
fi

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
