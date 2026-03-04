FROM node:20-slim

# System dependencies + tmux for agent teams
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    tmux \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code globally
RUN npm install -g @anthropic-ai/claude-code

# Alias so you just type "claude" and get YOLO mode automatically
RUN echo 'alias claude="claude --dangerously-skip-permissions"' >> /etc/bash.bashrc

# Tmux config: mouse support + nice defaults
RUN echo 'set -g mouse on' > /etc/tmux.conf && \
    echo 'set -g base-index 1' >> /etc/tmux.conf

# Project directory
WORKDIR /workspace
