FROM node:20-slim

# System dependencies + tmux for agent teams
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    tmux \
    gosu \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code globally
RUN npm install -g @anthropic-ai/claude-code

# Use the existing node user (UID 1000) but rename for clarity
RUN usermod -l claude -d /home/claude -m node && groupmod -n claude node

# Wrapper: restore .claude.json if missing, then run YOLO mode
RUN cat >> /home/claude/.bashrc <<'BASH'
claude() {
  if [ ! -f ~/.claude/.claude.json ]; then
    local backup=$(ls -t ~/.claude/backups/.claude.json.backup.* 2>/dev/null | head -1)
    [ -n "$backup" ] && cp "$backup" ~/.claude/.claude.json
  fi
  command claude --dangerously-skip-permissions "$@"
}
BASH

# Tmux config: mouse support + nice defaults
RUN echo 'set -g mouse on' > /home/claude/.tmux.conf && \
    echo 'set -g base-index 1' >> /home/claude/.tmux.conf && \
    chown claude:claude /home/claude/.tmux.conf

# Entrypoint: fix ownership of mounted volumes, then drop to non-root
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /workspace
ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]
