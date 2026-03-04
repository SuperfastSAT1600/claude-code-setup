#!/bin/bash
# Start as root, fix permissions on mounted volumes, then drop to claude user

# Fix ownership of the credentials volume so claude user can read/write
chown -R claude:claude /home/claude/.claude 2>/dev/null || true

# Fix ownership of workspace so claude user can edit project files
chown -R claude:claude /workspace 2>/dev/null || true

# Mark workspace as safe for git
gosu claude git config --global --add safe.directory /workspace 2>/dev/null || true

# Drop to claude user and run whatever command was passed
exec gosu claude "$@"
