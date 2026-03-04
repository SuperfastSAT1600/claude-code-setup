#!/bin/bash
# Start as root, fix permissions on mounted volumes, then drop to claude user

# Fix ownership of the credentials volume so claude user can read/write
chown -R claude:claude /home/claude/.claude 2>/dev/null || true

# Fix ownership of workspace so claude user can edit project files
chown -R claude:claude /workspace 2>/dev/null || true

# Mark workspace as safe for git
gosu claude git config --global --add safe.directory /workspace 2>/dev/null || true

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
