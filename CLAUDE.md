# Claude Code Workflow Template

**Setup**: `node setup.cjs` → Follow prompts → Start using

---

## Must-Read First

- **PRD**: `docs/PRD.md` - Architecture, features, workflow patterns
- **Errors**: `.claude/user/errors.md` - Read this before every task

---

## Key Locations

**Your Data** (gitignored):
- `.claude/user/errors.md` - Error log
- `.claude/user/changelog.md` - System improvements
- `.claude/user/agent-errors/` - Subagent errors

**Documentation**:
- `docs/PRD.md` - Product requirements, architecture
- `.claude/rules/` - Mandatory protocols
- `.claude/agents/INDEX.md` - All 34 specialists
- `.claude/skills/` - Domain patterns

**Configuration**:
- `.claude/settings.json` - Shared settings (hooks, MCP)
- `.claude/settings.local.json` - Local overrides (gitignored)

---

## Commands

- `/health-check` - System diagnostics
- `/commit` - Smart git commit
- `/review-changes` - Code review
- `/plan` - Implementation planning

See `.claude/commands/README.md` for all commands.

---

## Updating System

```bash
./.claude/scripts/update-system.sh
```

The script automatically:
- Clones `claude-code-setup` (if needed) to parent directory
- Pulls latest changes from the repository
- Updates system files while preserving your data

**Preserved**: `.claude/user/`, `settings.local.json`, `CLAUDE.md`
**Updated**: agents, skills, rules, commands, workflows, templates
