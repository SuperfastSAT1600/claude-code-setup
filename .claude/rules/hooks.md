# Hooks Rules

Automate quality checks with hooks. Keep them fast (<100ms).

---

## 1. Hook Types

| Type | When | Use For |
|------|------|---------|
| PreToolUse | Before tool executes | Validation, warnings |
| PostToolUse | After tool completes | Formatting, linting |
| Stop | Session ends | Cleanup, reports |

---

## 2. Performance

**Rule**: Hooks must complete in <100ms.

```json
// ✅ Fast: grep -q exits early
{ "command": "grep -q 'TODO' \"$file_path\" && echo 'TODO found' >&2" }

// ❌ Slow: Full test suite
{ "command": "npm test && npm run lint && npm audit" }
```

### Tips
- Use `grep -q` (quiet mode, exits early)
- Check single files, not project
- Avoid network requests
- Use `|| true` to prevent blocking

---

## 3. Matchers

```json
// File types
"tool_input.file_path matches \"\\\\.tsx?$\""

// Tools
"tool in [\"Edit\", \"Write\"]"

// Git commands
"tool == \"Bash\" && tool_input.command matches \"git push.*main\""
```

---

## 4. Variables

- `$file_path` - File being edited
- `$tool` - Tool name
- `$tool_input` - JSON input

---

## 5. Common Patterns

### Auto-Format (PostToolUse)
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"] && tool_input.file_path matches \"\\\\.tsx?$\"",
  "hooks": [{ "type": "command", "command": "npx prettier --write \"$file_path\" 2>&1 | head -1" }]
}
```

### Secret Detection (PreToolUse)
```json
{
  "when": "PreToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{ "type": "command", "command": "grep -iE '(api.?key|password|secret)\\s*=' \"$file_path\" && echo '[Hook] Secret detected!' >&2 || true" }]
}
```

### Git Push Warning
```json
{
  "when": "PreToolUse",
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git push.*main\"",
  "hooks": [{ "type": "command", "command": "echo '[Hook] Pushing to main!' >&2" }]
}
```

### File Size Check
```json
{
  "when": "PostToolUse",
  "matcher": "tool in [\"Edit\", \"Write\"]",
  "hooks": [{ "type": "command", "command": "[ $(wc -l < \"$file_path\") -gt 300 ] && echo '[Hook] >300 lines' >&2 || true" }]
}
```

---

## 6. Severity

```bash
echo "Info message"              # stdout - info
echo "Warning" >&2               # stderr - warning
echo "Error" >&2 && exit 1       # stderr + exit - blocks
```

---

## 7. Disabling

```json
// .claude/settings.local.json
{ "hooks": [] }
```

---

## Checklist

- [ ] Completes in <100ms
- [ ] Matcher is specific
- [ ] Errors handled (`|| true`)
- [ ] Output concise (`| head`)
- [ ] Tested before deployment
