#!/bin/bash
# Start as root, fix permissions on mounted volumes, then drop to claude user

# ── Copy host credentials to container-local dir ────────
# Host ~/.claude is mounted READ-ONLY at /host-claude.
# We copy it to /home/claude/.claude so each container gets
# its own mutable copy — no conflicts between containers.
if [ -d /host-claude ]; then
    mkdir -p /home/claude/.claude
    cp -a /host-claude/. /home/claude/.claude/ 2>/dev/null || true
fi

# Auto-restore .claude.json from backup if missing
# Claude Code moves this file during startup, which can leave it missing
CLAUDE_HOME="/home/claude/.claude"
if [ ! -f "$CLAUDE_HOME/.claude.json" ]; then
    LATEST_BACKUP=$(ls -t "$CLAUDE_HOME/backups/.claude.json.backup."* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP" "$CLAUDE_HOME/.claude.json"
        echo "Restored .claude.json from backup"
    fi
fi

# Fix ownership so claude user can read/write
chown -R claude:claude /home/claude/.claude 2>/dev/null || true

# Fix ownership of workspace so claude user can edit project files
chown -R claude:claude /workspace 2>/dev/null || true

# Mark workspace as safe for git
gosu claude git config --global --add safe.directory /workspace 2>/dev/null || true

# ── Git worktree support ────────────────────────────────
# If WORKTREE_NAME is set (by docker-run.sh), the main repo's .git
# is mounted at /main-git. We set GIT_DIR and GIT_WORK_TREE env vars
# so git works without modifying any files on the host.
if [ -n "$WORKTREE_NAME" ] && [ -d /main-git ]; then
    chown -R claude:claude /main-git 2>/dev/null || true
    gosu claude git config --global --add safe.directory /main-git 2>/dev/null || true

    export GIT_DIR="/main-git/worktrees/$WORKTREE_NAME"
    export GIT_WORK_TREE="/workspace"

    echo "Git worktree configured for container (env vars)"
fi

# Patch .mcp.json for Linux: replace Windows "cmd /c npx" → "npx"
if [ -f /workspace/.mcp.json ]; then
    node -e '
const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("/workspace/.mcp.json", "utf8"));
let patched = false;
for (const [name, srv] of Object.entries(cfg.mcpServers || {})) {
  if (srv.command === "cmd" && srv.args && srv.args[0] === "/c" && srv.args[1] === "npx") {
    srv.command = "npx";
    srv.args = srv.args.slice(2);
    patched = true;
  }
}
if (patched) {
  fs.copyFileSync("/workspace/.mcp.json", "/workspace/.mcp.json.host-backup");
  fs.writeFileSync("/workspace/.mcp.json", JSON.stringify(cfg, null, 2) + "\n");
  console.log("Patched .mcp.json for Linux (backup: .mcp.json.host-backup)");
}
' 2>/dev/null || true
fi

# Drop to claude user and run whatever command was passed
exec gosu claude "$@"
