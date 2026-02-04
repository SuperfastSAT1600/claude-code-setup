# Error Verification System

Automated enforcement that ensures `.claude/user/errors.md` is read before any work begins.

---

## How It Works

**Hook-based verification** prevents Claude from starting work without reading the error log.

### Components

1. **Marker file**: `.claude/user/.errors-read-marker`
   - Created when `errors.md` is read
   - Timestamp-based (valid for 5 minutes)
   - Ephemeral (not committed to git)

2. **Mark script**: `.claude/scripts/mark-errors-read.sh`
   - PostToolUse hook on `Read` tool
   - Triggers when `errors.md` is read
   - Updates marker timestamp

3. **Verify script**: `.claude/scripts/verify-errors-read.sh`
   - PreToolUse hook on work tools (Edit/Write/Task/Bash)
   - Checks if marker exists and is fresh
   - Blocks execution if marker is missing/stale

### Flow

```
User starts conversation
↓
Claude attempts first work action (Edit/Write/Bash/Task)
↓
PreToolUse hook: verify-errors-read.sh runs
↓
Marker exists + fresh? ──YES──> Allow execution
↓ NO
Block with error message
↓
Claude reads .claude/user/errors.md
↓
PostToolUse hook: mark-errors-read.sh runs
↓
Marker created/updated
↓
Retry work action → Success
```

---

## Testing

### Test 1: Fresh Session (Should Block)

```bash
# Remove marker to simulate fresh session
rm .claude/user/.errors-read-marker

# Try to create a file (should block)
# Expected: Hook blocks with message to read errors.md first
```

### Test 2: After Reading (Should Pass)

```bash
# Read errors.md
claude read .claude/user/errors.md

# Try to create a file (should succeed)
# Expected: Hook allows execution
```

### Test 3: Stale Session (Should Block)

```bash
# Create old marker (>5 minutes ago)
touch -t 202601010000 .claude/user/.errors-read-marker

# Try to create a file (should block)
# Expected: Hook blocks because marker is stale
```

---

## Debugging

### Check Hook Execution

```bash
# View hook output in Claude Code
# Hooks write to stderr, visible in CLI output
```

### Check Marker Status

```bash
# Check if marker exists
ls -la .claude/user/.errors-read-marker

# Check marker age (seconds)
stat -c %Y .claude/user/.errors-read-marker  # Linux
stat -f %m .claude/user/.errors-read-marker  # macOS
```

### Manual Marker Creation (Testing Only)

```bash
# Create marker manually
mkdir -p .claude/user
touch .claude/user/.errors-read-marker
```

---

## Configuration

### Session Timeout

Default: 5 minutes (300 seconds)

To change, edit `.claude/scripts/verify-errors-read.sh`:

```bash
SESSION_TIMEOUT=300  # Change this value
```

### Disable Verification (Not Recommended)

To temporarily disable, comment out the hook in `.claude/settings.json`:

```json
{
  "matcher": "tool in [\"Edit\", \"Write\", \"Task\"] || ...",
  "hooks": [
    {
      "type": "command",
      "command": "#!/bin/bash\n# ./.claude/scripts/verify-errors-read.sh"
    }
  ]
}
```

---

## Excluded Tools

**Not verified** (read-only, safe):
- `Read` - Always allowed
- `Glob` - File pattern search
- `Grep` - Content search
- `Bash` with read-only commands: `git status`, `git diff`, `git log`, `git branch`

**Verified** (work actions):
- `Edit` - File modifications
- `Write` - File creation
- `Task` - Agent delegation
- `Bash` with write commands: commits, installs, builds, etc.

---

## Gitignore

The marker file is NOT committed:

```gitignore
# .claude/.gitignore
user/.errors-read-marker
```

This ensures each session starts fresh.

---

## Troubleshooting

### Hook not running

1. Check hook is in `.claude/settings.json`
2. Verify script exists and is executable: `ls -l .claude/scripts/verify-errors-read.sh`
3. Check script syntax: `bash -n .claude/scripts/verify-errors-read.sh`

### Hook blocks even after reading

1. Check marker exists: `ls .claude/user/.errors-read-marker`
2. Check marker timestamp is recent: `stat .claude/user/.errors-read-marker`
3. Manually create marker: `touch .claude/user/.errors-read-marker`

### Script fails on Windows

Scripts use cross-platform `stat` command:
- Git Bash on Windows: uses Linux-style `stat -c %Y`
- macOS: uses BSD-style `stat -f %m`

If issues persist, check `$OSTYPE` variable:
```bash
echo $OSTYPE
```

---

## Benefits

1. **Structural enforcement** - Not reliant on Claude following instructions
2. **Fail-closed** - Blocks by default until verified
3. **Session-aware** - 5-minute timeout assumes same session
4. **Non-intrusive** - Only blocks work actions, not reads/searches
5. **Auditable** - Hook messages visible in CLI output

---

**Last Updated**: 2026-02-04
