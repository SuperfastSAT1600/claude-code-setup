# Hooks Rules

Automate quality checks and workflows with hooks. Use wisely to avoid slowdowns.

---

## 1. Hook Types

**Rule**: Understand when each hook type fires.

### PreToolUse
- **When**: Before a tool executes
- **Use for**: Validation, warnings, permission checks
- **Example**: Warn before pushing to main

### PostToolUse
- **When**: After a tool completes successfully
- **Use for**: Auto-formatting, linting, cleanup
- **Example**: Run Prettier after editing files

### Stop
- **When**: When Claude Code session ends
- **Use for**: Cleanup, notifications, reports
- **Example**: Generate session summary

---

## 2. Keep Hooks Fast

**Rule**: Hooks must complete in <100ms to avoid slowdowns.

### Fast Hooks (Good):
```json
{
  "type": "command",
  "command": "grep -q 'TODO' \"$file_path\" && echo 'TODO found' >&2"
}
```

### Slow Hooks (Bad):
```json
{
  "type": "command",
  "command": "npm test && npm run lint && npm audit"
}
```

### Performance Tips:
- Use `grep -q` (quiet mode, exits early)
- Check single files, not entire project
- Avoid network requests
- Don't run test suites
- Cache results when possible

---

## 3. Hook Matchers

**Rule**: Use precise matchers to target specific operations.

### Matcher Syntax:
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.tsx?$\""
}
```

### Common Matchers:

**File Type Matching:**
```json
// TypeScript/JavaScript files
"tool_input.file_path matches \"\\\\.([tj]sx?|mjs|cjs)$\""

// Python files
"tool_input.file_path matches \"\\\\.py$\""

// Markdown files
"tool_input.file_path matches \"\\\\.md$\""
```

**Tool Matching:**
```json
// Edit or Write
"tool in [\"Edit\", \"Write\"]"

// Bash commands
"tool == \"Bash\""

// Git operations
"tool == \"Bash\" && tool_input.command matches \"^git\""
```

**Command Matching:**
```json
// Git push to main
"tool == \"Bash\" && tool_input.command matches \"git push.*main\""

// npm install
"tool == \"Bash\" && tool_input.command matches \"npm install\""
```

---

## 4. Hook Severity Levels

**Rule**: Use appropriate output streams for different severities.

### Severity Levels:
```bash
# Info (stdout)
echo "Running formatter..."

# Warning (stderr)
echo "Warning: Console.log detected" >&2

# Error (stderr + exit code)
echo "Error: Tests failed" >&2
exit 1
```

### When to Block:
- ❌ Don't block for warnings
- ✅ Block for critical errors (secrets, breaking changes)
- ✅ Allow user override with `--no-verify`

---

## 5. Common Hook Patterns

### Pattern 1: Auto-formatting
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"] && tool_input.file_path matches \"\\\\.([tj]sx?|json)$\"",
  "hooks": [{
    "type": "command",
    "command": "npx prettier --write \"$file_path\" 2>&1 | head -1"
  }]
}
```

### Pattern 2: Linting
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"] && tool_input.file_path matches \"\\\\.tsx?$\"",
  "hooks": [{
    "type": "command",
    "command": "npx eslint \"$file_path\" --fix --quiet"
  }]
}
```

### Pattern 3: Secret Detection
```json
{
  "when": "PreToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{
    "type": "command",
    "command": "grep -i -E '(api.?key|password|secret|token)\\s*=\\s*['\"]\\w+['\"]' \"$file_path\" && echo '[Hook] Possible secret detected!' >&2 || true"
  }]
}
```

### Pattern 4: TODO Tracking
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{
    "type": "command",
    "command": "grep -n 'TODO:' \"$file_path\" 2>/dev/null | while read line; do echo \"[TODO] $line\" >&2; done || true"
  }]
}
```

### Pattern 5: Git Push Warning
```json
{
  "when": "PreToolUse",
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git push.*(main|master)\"",
  "hooks": [{
    "type": "command",
    "command": "echo '[Hook] Pushing to main! Ensure tests pass and code is reviewed.' >&2"
  }]
}
```

### Pattern 6: Test Before Commit
```json
{
  "when": "PreToolUse",
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git commit\"",
  "hooks": [{
    "type": "command",
    "command": "npm test --silent || (echo '[Hook] Tests failed! Fix before committing.' >&2 && exit 1)"
  }]
}
```

---

## 6. Hook Variables

**Rule**: Use available variables in hook commands.

### Available Variables:
- `$file_path` - Full path to file being edited/written
- `$tool` - Tool being used (Edit, Write, Bash, etc.)
- `$tool_input` - JSON of tool input

### Example Usage:
```bash
# Check file size
du -h "$file_path" | awk '{if ($1 > "500K") print "Large file:" $2}'

# Get file extension
ext="${file_path##*.}"
if [ "$ext" = "ts" ]; then
  npx tsc --noEmit "$file_path"
fi

# Check file exists
if [ -f "$file_path" ]; then
  echo "File exists"
fi
```

---

## 7. Hook Debugging

**Rule**: Test hooks before committing to settings.

### Testing Hooks:
```bash
# Test command directly
file_path="src/test.ts"
grep -q 'TODO' "$file_path" && echo 'TODO found' >&2

# Check exit code
echo $?

# Test with various files
for file in src/*.ts; do
  file_path="$file"
  # your hook command here
done
```

### Debug Output:
```json
{
  "command": "echo \"[DEBUG] Processing: $file_path\" >&2 && your-actual-command"
}
```

---

## 8. Hook Best Practices

### Do:
- ✅ Keep hooks simple and fast
- ✅ Handle errors gracefully (`|| true`)
- ✅ Use quiet mode for checks (`-q`)
- ✅ Limit output (pipe to `head`)
- ✅ Test hooks before deployment

### Don't:
- ❌ Run full test suites in hooks
- ❌ Make network requests
- ❌ Modify files (except formatting)
- ❌ Use slow tools (heavy linters)
- ❌ Create infinite loops

---

## 9. Hook Organization

**Rule**: Group related hooks, comment purpose.

```json
{
  "hooks": [
    // Code Quality Hooks
    {
      "when": "PostToolUse",
      "matcher": "tool in [\"Edit\", \"Write\"]",
      "hooks": [
        { "type": "command", "command": "npx prettier --write \"$file_path\"" },
        { "type": "command", "command": "npx eslint \"$file_path\" --fix" }
      ]
    },

    // Security Hooks
    {
      "when": "PreToolUse",
      "matcher": "tool in [\"Edit\", \"Write\"]",
      "hooks": [
        { "type": "command", "command": "grep -i 'api.?key' \"$file_path\" && echo 'Secret detected!' >&2" }
      ]
    },

    // Git Safety Hooks
    {
      "when": "PreToolUse",
      "matcher": "tool == \"Bash\" && tool_input.command matches \"git push.*main\"",
      "hooks": [
        { "type": "command", "command": "echo 'Pushing to main!' >&2" }
      ]
    }
  ]
}
```

---

## 10. Disabling Hooks

**Rule**: Allow disabling hooks when needed.

### Project-Level:
```json
// .claude/settings.local.json
{
  "hooks": []  // Disable all hooks for this project
}
```

### Temporarily:
```bash
# Most git hooks respect --no-verify
git commit --no-verify

# For Claude Code, check settings
```

---

## Hook Examples Library

### Console.log Detection:
```json
{
  "when": "PreToolUse",
  "matcher": "tool == \"Write\" && tool_input.file_path matches \"\\\\.([tj]sx?)$\"",
  "hooks": [{
    "type": "command",
    "command": "grep -n 'console\\.log' \"$file_path\" 2>/dev/null && echo '[Hook] console.log detected - remove before commit' >&2 || true"
  }]
}
```

### File Size Check:
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{
    "type": "command",
    "command": "[ $(wc -l < \"$file_path\") -gt 300 ] && echo \"[Hook] File has >300 lines - consider splitting\" >&2 || true"
  }]
}
```

### Import Organization (TypeScript):
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"] && tool_input.file_path matches \"\\\\.tsx?$\"",
  "hooks": [{
    "type": "command",
    "command": "npx organize-imports-cli \"$file_path\""
  }]
}
```

### Dead Code Detection:
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{
    "type": "command",
    "command": "grep -n 'function.*{.*}.*// unused' \"$file_path\" 2>/dev/null && echo '[Hook] Unused code detected' >&2 || true"
  }]
}
```

---

## Hooks Checklist

Before adding a hook:
- [ ] Hook completes in <100ms
- [ ] Matcher is specific enough
- [ ] Errors handled gracefully (`|| true`)
- [ ] Output is concise (use `| head`)
- [ ] Tested with various file types
- [ ] Doesn't block unnecessarily

---

## Resources

- Hooks Documentation: [Claude Code docs]
- Git Hooks: https://git-scm.com/docs/githooks
- Bash Best Practices: https://google.github.io/styleguide/shellguide.html
