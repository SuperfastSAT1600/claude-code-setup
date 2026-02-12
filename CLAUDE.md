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

**Forbidden**: moment.js, full lodash
<!-- Add your forbidden dependencies here -->

---

## Main Agent Templates

When creating React code:
- `variants/react/component.tsx.template` - Components with TypeScript
- `variants/react/form.tsx.template` - Forms with React Hook Form + Zod
- `variants/react/hook.ts.template` - Custom hooks with proper cleanup
- `variants/react/context.tsx.template` - Context providers with type safety
- `variants/react/hoc.tsx.template` - HOCs with ref forwarding

---

## Updating System

```bash
cd ..
git clone https://github.com/YOUR_REPO/claude-code-setup.git  # or git pull
cd claude-code-setup
./.claude/scripts/update-system.sh
```

**Preserved**: `.claude/user/`, `settings.local.json`, `CLAUDE.md`
**Updated**: agents, skills, rules, commands, workflows, templates
